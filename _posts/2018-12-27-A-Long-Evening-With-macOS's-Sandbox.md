---
title: A long evening with iOS and macOS Sandbox
layout: post
---
Hi there! It's GeoSn0w. The macOS Sandbox has always been a mysterious thing that I liked to poke at with various tools and with the knowledge I have gathered from reference books such as Jonathan Levin's \*OS Internals, and Apple's own not-so-detailed documentation. Of course, it's nothing new that Apple's documentation on their own security mechanisms isn't the best. The Sandbox has a very long history and it's been with us, macOS users for quite a long time, only to spin off to iOS and the rest of the \*OSes and to become more powerful over time. Apple's been doing their darn best to harden the Sandbox as well as many other security mechanisms in their operating systems, so let's grab a cup of coffee and dive a bit into the marvel that is the macOS Sandbox.

### A bit of historical value

The Sandbox is definitely not new. It's been first introduced in OS X 10.5 "Leopard", many, many moons ago, and it was called "SeatBelt". The idea was simple, just like you buckle your seatbelt to be safe on a car journey, the developer should voluntarily enforce the sandbox upon their applications to restrict their access to the system. As you can probably imagine, not many developers did this, and since the initial concept of the "SeatBelt" was voluntary confinement, Apple couldn't do much. Paired with the <code class="high">MandatoryAccessControl (MAC) Framework</code>, the idea of Sandbox was definitely not bad, but nowhere near successful. The MACF framework is pretty much the foundation on top of which the entire security model of the Apple devices is built.

Enter OS X 10.7. With Apple having learned their lesson, SandBox evolves now to no longer depend on the developer to enforce it upon their apps, it is enforced by default. Thing is, Apple enforces the SandBox, even as of today on macOS Mojave, based on an entitlement the applications own, which is <code class="high">com.apple.security.app-sandbox</code>. If the application has this entitlement, it will be placed in a container regardless of the wish of the developer. To be frank, developer's opinion is kinda moot anyway, because applications uploaded into the macOS App Store are signed by Apple and during the signing process, Apple graciously slaps the Sandbox entitlement on the application thus forcing the containerization of any App Store application. 

An important aspect to keep in mind is that compared to iOS' Sandbox, macOS has it easier. See, on iOS, there is no way for you, a third party app developer to ever escape your Sandbox unless you use a Sandbox escape technique, most of the times powered by a Kernel exploit or a Sandbox escape exploit. All 3rd-party applications, regardless of where they've been installed / side-loaded from, are placed on iOS in <code class="high">/var/mobile/Containers</code> and <code class="high">/var/Containers</code>. These paths have changed a lot beginning with iOS 8 when new folders were created and things were moved around to separate App resources, static from runtime data, so on older iOS, you may find the apps installed in <code class="high">/var/mobile/Applications</code> or even <code class="high">/var/mobile/Containers/Bundle/</code>. It doesn't matter. Anything in <code class="high">/var/</code> is destined to be Sandboxed and there is no way around it because you cannot just install your app elsewhere, unless you Jailbreak the device, of course. On macOS, only App Store apps are guaranteed to be sandboxed. If you get an application in a DMG image from a developer website (which is extremely common), it is very likely not sandboxed.

### But what exactly is the Sandbox doing anyways?

The Sandbox' sole purpose is to restrict applications from accessing various resources of the system. This can be either syscalls, files or whatever. It's pretty much put in place to do damage control. See, on iOS for example, if you're gullible enough, I can trick you into installing a malicious application, but it would be pointless because unless I go out of my way to use a Kernel or Sandbox escape exploit (which are usually not available for the latest iOS version), then my application cannot do much harm to your device. If I want to be a complete dick and remove some important files from your phone to make it never boot again, I cannot. Stock iOS enforces the Sandbox amongst other protections against unauthorized access, so my application will have access to nothing but its own container in which it cannot do much damage. The app may still be able to collect some data or do some nasty stuff, but nowhere near the imminent death it could have caused to the system had it had unfettered access. The same thing applies to macOS App Store apps, but not for apps that come in DMG format which are likely not sandboxed.

The Sandbox is actually a very good idea, that's probably why it stuck with Apple to the present day. Imagine Windows. I can trick you fairly easy to open a program you downloaded from a shady source and that program will graciously delete the <code class="high">System32</code> folder or other important files. Why? Because there is no Sandbox in place on Windows. Yes, some resources need the user to confirm they want to open a program in "Administrator mode", thus elevating the privileges, but it has become second nature to many people to just press "Run", so it won't protect much.

Apple puts it simply: Sandbox is an access control technology enforced at kernel level (where you, the user, or any compromised app from whatever source wouldn't normally have control). The Sandbox pretty much ensures that it hocks (intercepts) all operations done by the sandboxed application and forbids access to resources the app is not given access to. You can imagine throwing your app in a jail cell and watching its every step.

On macOS, the Sandbox itself is not a single file or a single process, it is split into multiple components that work together to create the Sandbox. At first, we have the <code class="high">userland daemon</code> located in <code class="high">/usr/libexec/sandboxd</code>, there is the <code class="high">com.apple.security.sandbox</code> which is a <code class="high">kext (Kernel Extension)</code>, and there's also the <code class="high">AppSandbox</code> private framework which relies on <code class="high">AppContainer.Framework</code>. As you can see, multiple components work together to implement what we call the <code class="high">App Sandbox</code>.

You can see the kext being active on macOS by running the <code class="high">kextstat | grep "sand"</code> command in Terminal.

```bash
Isabella:/ geosn0w$ kextstat | grep "sand"
   38    1 0xffffff7f811a3000 0x21000    0x21000    com.apple.security.sandbox (300.0) BDFF700A-6746-3643-A0A1-852628695B04 <37 30 18 7 6 5 4 3 2 1>
Isabella:/ geosn0w$ 
```
The Sandbox is one of the multiple <code class="high">MACF Policy modules</code>. The <code class="high">CodeSign</code> enforced by <code class="high">AMFI (Apple Mobile File Integrity)</code> is another module.

### Experiment: Determining whether an app on macOS is sandboxed or not based on its entitlements
As I mentioned earlier, a telltale sign that the app is sandboxed, is the presence of <code class="high">com.apple.security.app-sandbox</code> entitlement in the application binary. We can check the entitlements on macOS using multiple tools, but my favorite is <code class="high">jtool</code> by Jonathan Levin. By running the command <code class="high">./jtool --ent /Applications/AppName.app</code> in Terminal, we can see the full list of entitlements that the application possesses. Let's try it with iHex, an app I got from the macOS App Store, and then with OpenBoardView - an app downloaded in DMG format.

Running the command in Terminal yields the following result for iHex:
<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/50491344-d3f64580-09df-11e9-9094-39fa79c6fed7.png"/>
</p>

Alright, so, a few things demand an explanation here. At first, as you can see, the entitlement is present and the key is set to <code class="high">true</code>. This application will be Sandboxed. Now, as you could see, these entitlements are listed in a format akin to XML. That is because they're actually in a <code class="high">.PLIST or Property List</code> file which is nothing but a glorified XML. PLISTs can, however, come in binary format, but one can easily convert them in the human-readable format by using the command <code class="high">plutil -convert xml1 -o</code>.

Using <code class="high">Jtool</code>, one can easily replace the entitlements of the application but that requires fake-signing the app. All in all, this is a method to unsandbox a macOS application. This cannot be easily done on iOS because the sandboxing there is based on the location where the app is installed and not solely on the possession of an entitlement.

Let's now take a look at OpenBoardView, an app that wasn't downloaded from the App Store.
<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/50491825-4700bb80-09e2-11e9-887e-2fcef1260437.png"/>
</p>

As you can see, the application has no entitlements whatsoever. It will not be sandboxed and this means that it can access way more sources than any App Store application. We can inject the sandbox entitlement into it with <code class="high">jtool</code>, but the point is, yes, non-App Store apps are, indeed, more dangerous.

Remember, the <code class="high">com.apple.security.app-sandbox</code> entitlement was not added by the developer of the iHEX application, it was added automatically by Apple in the process of signing when the application got published in the App Store and there is nothing the developer could do to remove the entitlement, other than distributing their app via other means. Normally the entitlements tell what your application CAN do. In the case of this entitlement, it pretty much limits the application heavily from accessing system resources or user data.

Another way of checking whether the application is sandboxed or not is to run the command <code class="high">asctl sandbox check --pid XYZ</code> where XYZ is the <code class="high">PID (Process ID)</code> of the application you're interested in. You can get the <code class="high">PID</code> of a running process from the <code class="high">Activity Monitor</code> application on macOS. Here's the output of the <code class="high">asctl</code> command.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/50493572-58e75c00-09ec-11e9-87f5-4ab9d05fcf54.png"/>
</p>

### How is the Sandbox enforced?
Okay, we established what the Sandbox is, how you know you are sandboxed and why you are sandboxed in the first place, but what exactly happens when a sandboxed application runs? 

Enter containers. A container is pretty much just a folder placed on <code class="high">$HOME/Library/Containers/</code>. This folder is created for any sandboxed application regardless of the place the actual binary is installed on. The folder follow a simple structure, but most importantly, it contains a <code class="high">Container.Plist</code> file which contains information about the application whose Container this is (identified by its <code class="high">CFBundleIdentifier</code>), the <code class="high">SandboxProfileData</code>, the <code class="high">SandboxProfileDataValidationInfo</code> and the <code class="high">Version</code> of the Sandbox.

Let's find iHEX' Container.
We can easily do that by changing directory (cd) to the path mentioned above, and then running <code class="high">ls -lF com.hewbo.hexeditor</code>. Where <code class="high">com.hewbo.hexeditor</code> is the <code class="high">CFBundleIndentifier</code> of the iHex app (you can find it in the <code class="high">Info.Plist</code> inside the .app folder).

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/50492230-757f9600-09e4-11e9-94a3-21fa6aafc812.png"/>
</p>

Okay, so you can see that the container of the app contains a <code class="high">Data</code> folder as well as the aforementioned Container.Plist file. The Data folder is very interesting. If you change directory (cd) into it you can see that it simulates the user's Home directory. Of course, all of those are tightly controlled symlinks. The control is being enforced by the Container.plist which contains the <code class="high">SandboxProfileDataValidationRedirectablePathsKey</code> that dictates which symlinks are approved.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/50492397-58979280-09e5-11e9-8cb6-dc964d24819e.png"/>
</p>

### Sandboxed from moment one
When you start an application, internally, the Kernel will get to call the function <code class="high">mac_execve</code>, which can be seen in the XNU source code. The <code class="high">__mac_execve</code> will pretty much load the binary but it will also check the <code class="high">MAC label</code> to see whether Sandbox should be enforced. At this point, the system is aware that you are going to be Sandboxed but you're not just yet.

```c
/*
 * __mac_execve
 *
 * Parameters:    uap->fname        File name to exec
 *        uap->argp        Argument list
 *        uap->envp        Environment list
 *        uap->mac_p        MAC label supplied by caller
 *
 * Returns:    0            Success
 *        EINVAL            Invalid argument
 *        ENOTSUP            Not supported
 *        ENOEXEC            Executable file format error
 *    exec_activate_image:EINVAL    Invalid argument
 *    exec_activate_image:EACCES    Permission denied
 *    exec_activate_image:EINTR    Interrupted function
 *    exec_activate_image:ENOMEM    Not enough space
 *    exec_activate_image:EFAULT    Bad address
 *    exec_activate_image:ENAMETOOLONG    Filename too long
 *    exec_activate_image:ENOEXEC    Executable file format error
 *    exec_activate_image:ETXTBSY    Text file busy [misuse of error code]
 *    exec_activate_image:EBADEXEC    The executable is corrupt/unknown
 *    exec_activate_image:???
 *    mac_execve_enter:???
 *
 * TODO:    Dynamic linker header address on stack is copied via suword()
 */
int
__mac_execve(proc_t p, struct __mac_execve_args *uap, int32_t *retval)
{
    char *bufp = NULL; 
    struct image_params *imgp;
    struct vnode_attr *vap;
    struct vnode_attr *origvap;
    int error;
    char alt_p_comm[sizeof(p->p_comm)] = {0};    /* for PowerPC */
    int is_64 = IS_64BIT_PROCESS(p);
    struct vfs_context context;

    context.vc_thread = current_thread();
    context.vc_ucred = kauth_cred_proc_ref(p);    /* XXX must NOT be kauth_cred_get() */

    /* Allocate a big chunk for locals instead of using stack since these  
     * structures a pretty big.
     */
    MALLOC(bufp, char *, (sizeof(*imgp) + sizeof(*vap) + sizeof(*origvap)), M_TEMP, M_WAITOK | M_ZERO);
    imgp = (struct image_params *) bufp;
    if (bufp == NULL) {
        error = ENOMEM;
        goto exit_with_error;
    }
    vap = (struct vnode_attr *) (bufp + sizeof(*imgp));
    origvap = (struct vnode_attr *) (bufp + sizeof(*imgp) + sizeof(*vap));
    
    /* Initialize the common data in the image_params structure */
    imgp->ip_user_fname = uap->fname;
    imgp->ip_user_argv = uap->argp;
    imgp->ip_user_envv = uap->envp;
    imgp->ip_vattr = vap;
    imgp->ip_origvattr = origvap;
    imgp->ip_vfs_context = &context;
    imgp->ip_flags = (is_64 ? IMGPF_WAS_64BIT : IMGPF_NONE) | ((p->p_flag & P_DISABLE_ASLR) ? IMGPF_DISABLE_ASLR : IMGPF_NONE);
    imgp->ip_p_comm = alt_p_comm;        /* for PowerPC */
    imgp->ip_seg = (is_64 ? UIO_USERSPACE64 : UIO_USERSPACE32);

#if CONFIG_MACF
    if (uap->mac_p != USER_ADDR_NULL) {
        error = mac_execve_enter(uap->mac_p, imgp);
        if (error) {
            kauth_cred_unref(&context.vc_ucred);
            goto exit_with_error;
        }
    }
#endif

    error = exec_activate_image(imgp);

    kauth_cred_unref(&context.vc_ucred);
    
    /* Image not claimed by any activator? */
    if (error == -1)
        error = ENOEXEC;

    if (error == 0) {
        exec_resettextvp(p, imgp);
        error = check_for_signature(p, imgp);
    }    
    if (imgp->ip_vp != NULLVP)
        vnode_put(imgp->ip_vp);
    if (imgp->ip_strings)
        execargs_free(imgp);
#if CONFIG_MACF
    if (imgp->ip_execlabelp)
        mac_cred_label_free(imgp->ip_execlabelp);
    if (imgp->ip_scriptlabelp)
        mac_vnode_label_free(imgp->ip_scriptlabelp);
#endif
    if (!error) {
        struct uthread    *uthread;

        /* Sever any extant thread affinity */
        thread_affinity_exec(current_thread());

        DTRACE_PROC(exec__success);
        uthread = get_bsdthread_info(current_thread());
        if (uthread->uu_flag & UT_VFORK) {
            vfork_return(p, retval, p->p_pid);
            (void)thread_resume(imgp->ip_new_thread);
        }
    } else {
        DTRACE_PROC1(exec__failure, int, error);
    }

exit_with_error:
    if (bufp != NULL) {
        FREE(bufp, M_TEMP);
    }
    
    return(error);
}

```
When the process starts, quite eraly in its lifetime it will load <code class="high">libSystem.B</code> because all the APIs rely on it. At some point during the execution, <code class="high">libSystem.B.initializer</code> will fall to <code class="high">_libsecinit_setup_secinitd_client</code> which will then fall to <code class="high">xpc_copy_entitlements_for_pid</code> to grab the Entitlements from the application binary, and then it will send the entitlements as well as whether the application is supposed to be sandboxed via an XPC message to <code class="high">secinitd</code> daemon located in <code class="high">/usr/libexec/secinitd</code>. This message transfer happens at <code class="high">xpc_pipe_route</code> level. The same function will handle the message receive from the <code class="high">secinitd</code> daemon which will parse the XPC message received from the process.

The <code class="high">secinitd</code> dameon will acknowledge the fact that sandboxing should be enforced if the entitlement is present, then it will call upon the <code class="high">AppSandbox.Framework</code> to create the <code class="high">sandbox profile</code>. After the profile is created <code class="high">secinitd</code> will return an <code class="high">XPC message</code> containing the <code class="high">CONTAINER_ID_KEY, CONTAINER_ROOT_PATH_KEY, SANDBOX_PROFILE_DATA_KEY</code>, amongst other data. This information will be parsed by <code class="high">_libsecinit_setup_app_sandbox</code> which then falls into <code class="high">__sandbox_ms</code> thus creating the sandbox of the application and containerizing it at runtime.

Since this is a pretty confusing explanation, thanks to a diagram made by Jonathan Levin (Figure 8-4) in \*OS Internals Volume III, I managed to create my own version of the diagram which is a bit more simplified but should suffice. Huge thanks to Jonathan for his research, it is him who put together the research material I used to understand how the Sandbox works.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/50495021-9a7c0500-09f4-11e9-9050-72792ceda700.png"/>
</p>

### Experiment: Tracing the App Sandbox as it is being created at runtime
So, now that we have an idea of how the Sandbox works, let's see it in action. Using LLDB we can debug a sandboxed application and see exactly what is going on, down to the XPC messages being passed over from the process to <code class="high">secinitd</code> daemon. We're about to dive into Terminal and LLDB, so the following listing may appear very hard to follow. To make it easier on yourself to understand what is going on, it's best to try to follow the important logic like the messages being passed around and the backtrace to see what function calls we do.

At first, we start by opening the Terminal and calling lldb. If you don't have LLDB installed, install Xcode as it comes with all the debugging tools you need. 
First, we start by setting a few break points. We're doing to break at <code class="high">xpc_pipe_routine</code> where the XPC messages are sent and received, and at <code class="high">__sandbox_ms</code> which is the Sandbox MACF syscall.

```bash
Last login: Thu Dec 27 16:44:59 on ttys000
Isabella:~ geosn0w$ lldb /Applications/iHex.app/Contents/MacOS/iHex 
(lldb) target create "/Applications/iHex.app/Contents/MacOS/iHex"
Traceback (most recent call last):
  File "<string>", line 1, in <module>
  File "/Applications/Xcode.app/Contents/SharedFrameworks/LLDB.framework/Resources/Python/lldb/__init__.py", line 98, in <module>
    import six
ImportError: No module named six
Traceback (most recent call last):
  File "<string>", line 1, in <module>
NameError: name 'run_one_line' is not defined
Traceback (most recent call last):
  File "<string>", line 1, in <module>
Current executable set to '/Applications/iHex.app/Contents/MacOS/iHex' (x86_64).
(lldb) b xpc_pipe_routine
Breakpoint 1: where = libxpc.dylib`xpc_pipe_routine, address = 0x0000000000005c40
(lldb) b __sandbox_ms
Breakpoint 2: where = libsystem_kernel.dylib`__mac_syscall, address = 0x000000000001c648
(lldb) run
Process 12594 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x00007fff6a75ec40 libxpc.dylib`xpc_pipe_routine
libxpc.dylib`xpc_pipe_routine:
->  0x7fff6a75ec40 <+0>: pushq  %rbp
    0x7fff6a75ec41 <+1>: movq   %rsp, %rbp
    0x7fff6a75ec44 <+4>: pushq  %r15
    0x7fff6a75ec46 <+6>: pushq  %r14
Target 0: (iHex) stopped.
(lldb) c
Process 12594 resuming
Process 12594 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x00007fff6a75ec40 libxpc.dylib`xpc_pipe_routine
libxpc.dylib`xpc_pipe_routine:
->  0x7fff6a75ec40 <+0>: pushq  %rbp
    0x7fff6a75ec41 <+1>: movq   %rsp, %rbp
    0x7fff6a75ec44 <+4>: pushq  %r15
    0x7fff6a75ec46 <+6>: pushq  %r14
Target 0: (iHex) stopped.
```

All fine and well, our breakpoints worked and we are now in <code class="high">libxpc.dylib</code> and we stopped at the <code class="high">xpc_pipe_routine</code>. Let's do a <code class="high">backtrace</code> to see what is going on. We can do that with the <code class="high">bt</code> command.

```bash
(lldb) bt
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
  * frame #0: 0x00007fff6a75ec40 libxpc.dylib`xpc_pipe_routine
    frame #1: 0x00007fff6a75eaad libxpc.dylib`_xpc_interface_routine + 167
    frame #2: 0x00007fff6a7650b5 libxpc.dylib`_xpc_uncork_domain + 529
    frame #3: 0x00007fff6a75ad85 libxpc.dylib`_libxpc_initializer + 1053
    frame #4: 0x00007fff680aa9c8 libSystem.B.dylib`libSystem_initializer + 126
    frame #5: 0x0000000100582ac6 dyld`ImageLoaderMachO::doModInitFunctions(ImageLoader::LinkContext const&) + 420
    frame #6: 0x0000000100582cf6 dyld`ImageLoaderMachO::doInitialization(ImageLoader::LinkContext const&) + 40
    ...
    frame #18: 0x000000010056d3d4 dyld`dyldbootstrap::start(macho_header const*, int, char const**, long, macho_header const*, unsigned long*) + 453
    frame #19: 0x000000010056d1d2 dyld`_dyld_start + 54
(lldb) c
Process 12594 resuming
Process 12594 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x00007fff6a75ec40 libxpc.dylib`xpc_pipe_routine
libxpc.dylib`xpc_pipe_routine:
->  0x7fff6a75ec40 <+0>: pushq  %rbp
    0x7fff6a75ec41 <+1>: movq   %rsp, %rbp
    0x7fff6a75ec44 <+4>: pushq  %r15
    0x7fff6a75ec46 <+6>: pushq  %r14
Target 0: (iHex) stopped.
```
Nope, not what we need. This is the <code class="high">_xpc_uncork_domain</code> function of <code class="high">libxpc.dylib</code>. We need the <code class="high">xpc_pipe_create</code> one. We press <code class="high">c</code> to continue and backtrace again.

```bash
(lldb) bt
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
  * frame #0: 0x00007fff6a75ec40 libxpc.dylib`xpc_pipe_routine
    frame #1: 0x00007fff6a75eaad libxpc.dylib`_xpc_interface_routine + 167
    frame #2: 0x00007fff6a75e5d3 libxpc.dylib`bootstrap_look_up3 + 185
    frame #3: 0x00007fff6a75e4ff libxpc.dylib`bootstrap_look_up2 + 41
    frame #4: 0x00007fff6a7609d7 libxpc.dylib`xpc_pipe_create + 60
    frame #5: 0x00007fff6a500485 libsystem_info.dylib`_mbr_xpc_pipe + 261
    frame #6: 0x00007fff6a50033f libsystem_info.dylib`_mbr_od_available + 15
    frame #7: 0x00007fff6a4fffe5 libsystem_info.dylib`mbr_identifier_translate + 645
    frame #8: 0x00007fff6a4ffbf5 libsystem_info.dylib`mbr_identifier_to_uuid + 53
    frame #9: 0x00007fff6a4ffbba libsystem_info.dylib`mbr_uid_to_uuid + 42
    frame #10: 0x00007fff6a734db4 libsystem_secinit.dylib`_libsecinit_setup_secinitd_client + 728
    frame #11: 0x00007fff6a734a7b libsystem_secinit.dylib`_libsecinit_initialize_once + 13
    frame #12: 0x00007fff6a3d5db8 libdispatch.dylib`_dispatch_client_callout + 8
    frame #13: 0x00007fff6a3d5d6b libdispatch.dylib`dispatch_once_f + 41
    frame #14: 0x00007fff680aa9d2 libSystem.B.dylib`libSystem_initializer + 136
    ....
    frame #29: 0x000000010056d1d2 dyld`_dyld_start + 54
 ```
Yep! We found what we need, the <code class="high">xpc_pipe_create</code> function. Now thanks to Jonathan Levin, I learned that you can use the <code class="high">p (char *) xpc_copy_description($rsi)</code> to view the message that is being sent through the XPC pipe which is super useful for debugging. We use the <code class="high">RSI</code> register as the message is the second argument (the first one is the pipe).

 ```bash
(lldb) p (char *) xpc_copy_description($rsi)
(char *) $0 = 0x0000000101101fa0 "<dictionary: 0x10100c430> { count = 9, transaction: 0, voucher = 0x0, contents =\n\t"subsystem" => <uint64: 0x10100c7a0>: 5\n\t"handle" => <uint64: 0x10100c540>: 0\n\t"instance" => <uuid: 0x10100c6e0> 00000000-0000-0000-0000-000000000000\n\t"routine" => <uint64: 0x10100c800>: 207\n\t"flags" => <uint64: 0x10100c750>: 8\n\t"name" => <string: 0x10100c620> { length = 42, contents = "com.apple.system.opendirectoryd.membership" }\n\t"type" => <uint64: 0x10100c4f0>: 7\n\t"targetpid" => <int64: 0x10100c680>: 0\n\t"domain-port" => <mach send right: 0x10100c590> { name = 1799, right = send, urefs = 5 }\n}"
```
Unfortunately, not what we need. This is just a handshake message. We continue.

```bash
(lldb) c
Process 12594 resuming
Process 12594 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x00007fff6a75ec40 libxpc.dylib`xpc_pipe_routine
libxpc.dylib`xpc_pipe_routine:
->  0x7fff6a75ec40 <+0>: pushq  %rbp
    0x7fff6a75ec41 <+1>: movq   %rsp, %rbp
    0x7fff6a75ec44 <+4>: pushq  %r15
    0x7fff6a75ec46 <+6>: pushq  %r14
Target 0: (iHex) stopped.
...
(lldb) c
Process 12594 resuming
Process 12594 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x00007fff6a75ec40 libxpc.dylib`xpc_pipe_routine
libxpc.dylib`xpc_pipe_routine:
->  0x7fff6a75ec40 <+0>: pushq  %rbp
    0x7fff6a75ec41 <+1>: movq   %rsp, %rbp
    0x7fff6a75ec44 <+4>: pushq  %r15
    0x7fff6a75ec46 <+6>: pushq  %r14
Target 0: (iHex) stopped.
(lldb) p (char *) xpc_copy_description($rsi)
(char *) $5 = 0x0000000102821a00 "<dictionary: 0x1010051b0> { count = 11, transaction: 0, voucher = 0x0, contents =\n\t"SECINITD_REGISTRATION_MESSAGE_SHORT_NAME_KEY" => <string: 0x10100c2d0> { length = 4, contents = "iHex" }\n\t"SECINITD_REGISTRATION_MESSAGE_IS_SANDBOX_CANDIDATE_KEY" => <bool: 0x7fffa2befb98>: true\n\t"SECINITD_REGISTRATION_MESSAGE_ENTITLEMENTS_DICT_KEY" => <dictionary: 0x101009690> { count = 6, transaction: 0, voucher = 0x0, contents =\n\t\t"com.apple.security.app-sandbox" => <bool: 0x7fffa2befb98>: true\n\t\t"com.apple.application-identifier" => <string: 0x101009a60> { length = 30, contents = "A9TT2D59XS.com.hewbo.hexeditor" }\n\t\t"com.apple.security.print" => <bool: 0x7fffa2befb98>: true\n\t\t"com.apple.security.files.user-selected.read-write" => <bool: 0x7fffa2befb98>: true\n\t\t"com.apple.developer.team-identifier" => <string: 0x101002ec0> { length = 10, contents = "A9TT2D59XS" }\n\t\t"com.apple.security.network.client" => <bool: 0x7fffa2befb98>: true\n\t}\n\t"SECINITD_REGISTRATION_MESSAGE_LIBRARY_VALIDATION_KEY" => <bool: 0x7fffa2befbb8>: false\n"
(lldb) 
```
Aargh! There we go! The precious message containing our application's entitlements and whether it is a candidate for the sandbox. As you can see, the <code class="high">SECINITD_REGISTRATION_MESSAGE_IS_SANDBOX_CANDIDATE_KEY</code> is set to <code class="high">bool true</code> and we do possess the <code class="high">com.apple.security.app-sandbox</code> entitlement. We're bound to be sandboxed.

Now that we saw exactly what the process has sent to <code class="high">secinitd</code>, let's see if the sandbox is being created. For that we're using the second breakpoint we've set, the one on <code class="high">__sandbox_ms</code>. Since the breakpoint is already set, we continue (c) until we hit it.

```bash
(lldb) bt
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
  * frame #0: 0x00007fff6a55f648 libsystem_kernel.dylib`__mac_syscall
    frame #1: 0x00007fff6a731bc9 libsystem_sandbox.dylib`sandbox_container_path_for_pid + 63
    frame #2: 0x00007fff6a4edd0c libsystem_coreservices.dylib`_dirhelper_init + 159
    frame #3: 0x00007fff6a71cf00 libsystem_platform.dylib`_os_once + 33
    frame #4: 0x00007fff6a4ee754 libsystem_coreservices.dylib`_dirhelper + 1873
    frame #5: 0x00007fff6a4604e9 libsystem_c.dylib`confstr + 525
    frame #6: 0x00007fff6a7354a5 libsystem_secinit.dylib`_libsecinit_setup_app_sandbox + 474 # As you can see, the Sandbox is set.
    frame #7: 0x00007fff6a734a82 libsystem_secinit.dylib`_libsecinit_initialize_once + 20
    frame #8: 0x00007fff6a3d5db8 libdispatch.dylib`_dispatch_client_callout + 8
    frame #9: 0x00007fff6a3d5d6b libdispatch.dylib`dispatch_once_f + 41
    frame #10: 0x00007fff680aa9d2 libSystem.B.dylib`libSystem_initializer + 136
    frame #11: 0x0000000100582ac6 dyld`ImageLoaderMachO::doModInitFunctions(ImageLoader::LinkContext const&) + 420
    frame #12: 0x0000000100582cf6 dyld`ImageLoaderMachO::doInitialization(ImageLoader::LinkContext const&) + 40
    frame #13: 0x000000010057e218 dyld`ImageLoader::recursiveInitialization(ImageLoader::LinkContext const&, unsigned int, char const*, ImageLoader::InitializerTimingList&, ImageLoader::UninitedUpwards&) + 330
    frame #14: 0x000000010057e1ab dyld`ImageLoader::recursiveInitialization(ImageLoader::LinkContext const&, unsigned int, char const*, ImageLoader::InitializerTimingList&, ImageLoader::UninitedUpwards&) + 221
    frame #15: 0x000000010057e1ab dyld`ImageLoader::recursiveInitialization(ImageLoader::LinkContext const&, unsigned int, char const*, ImageLoader::InitializerTimingList&, ImageLoader::UninitedUpwards&) + 221
    frame #16: 0x000000010057e1ab dyld`ImageLoader::recursiveInitialization(ImageLoader::LinkContext const&, unsigned int, char const*, ImageLoader::InitializerTimingList&, ImageLoader::UninitedUpwards&) + 221
    frame #17: 0x000000010057e1ab dyld`ImageLoader::recursiveInitialization(ImageLoader::LinkContext const&, unsigned int, char const*, ImageLoader::InitializerTimingList&, ImageLoader::UninitedUpwards&) + 221
    frame #18: 0x000000010057e1ab dyld`ImageLoader::recursiveInitialization(ImageLoader::LinkContext const&, unsigned int, char const*, ImageLoader::InitializerTimingList&, ImageLoader::UninitedUpwards&) + 221
    frame #19: 0x000000010057e1ab dyld`ImageLoader::recursiveInitialization(ImageLoader::LinkContext const&, unsigned int, char const*, ImageLoader::InitializerTimingList&, ImageLoader::UninitedUpwards&) + 221
    frame #20: 0x000000010057d34e dyld`ImageLoader::processInitializers(ImageLoader::LinkContext const&, unsigned int, ImageLoader::InitializerTimingList&, ImageLoader::UninitedUpwards&) + 134
    frame #21: 0x000000010057d3e2 dyld`ImageLoader::runInitializers(ImageLoader::LinkContext const&, ImageLoader::InitializerTimingList&) + 74
    frame #22: 0x000000010056e567 dyld`dyld::initializeMainExecutable() + 196
    frame #23: 0x0000000100573239 dyld`dyld::_main(macho_header const*, unsigned long, int, char const**, char const**, char const**, unsigned long*) + 7242
    frame #24: 0x000000010056d3d4 dyld`dyldbootstrap::start(macho_header const*, int, char const**, long, macho_header const*, unsigned long*) + 453
    frame #25: 0x000000010056d1d2 dyld`_dyld_start + 54
(lldb) 
```

And there we go, a call to <code class="high">_libsecinit_setup_app_sandbox</code> of <code class="high">libsystem_secinit.dylib</code> which means that our Sandbox has been created and we're about to be placed into it as we start. The next few continue commands would finally fall into <code class="high">sandbox_check_common</code> of <code class="high">libsystem_sandbox.dylib</code> and then finally into <code class="high">LaunchServices</code> after which the app is started through <code class="high">AppKit`-[NSApplication init]</code>.

```bash
(lldb) c
Process 13280 resuming
Process 13280 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x00007fff6a55f648 libsystem_kernel.dylib`__mac_syscall
libsystem_kernel.dylib`__mac_syscall:
->  0x7fff6a55f648 <+0>:  movl   $0x200017d, %eax          ; imm = 0x200017D 
    0x7fff6a55f64d <+5>:  movq   %rcx, %r10
    0x7fff6a55f650 <+8>:  syscall 
    0x7fff6a55f652 <+10>: jae    0x7fff6a55f65c            ; <+20>
Target 0: (iHex) stopped.
(lldb) bt
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
  * frame #0: 0x00007fff6a55f648 libsystem_kernel.dylib`__mac_syscall
    frame #1: 0x00007fff6a731646 libsystem_sandbox.dylib`sandbox_check_common + 322
    frame #2: 0x00007fff6a7318f9 libsystem_sandbox.dylib`sandbox_check_by_audit_token + 177
    frame #3: 0x00007fff43ae952e LaunchServices`_LSIsAuditTokenSandboxed + 149
    frame #4: 0x00007fff6a3d5db8 libdispatch.dylib`_dispatch_client_callout + 8
    frame #5: 0x00007fff6a3d5d6b libdispatch.dylib`dispatch_once_f + 41
    frame #6: 0x00007fff439c7ed1 LaunchServices`_LSIsCurrentProcessSandboxed + 178
    frame #7: 0x00007fff43ae92ec LaunchServices`_LSCheckMachPortAccessForAuditToken + 72
    frame #8: 0x00007fff43ae9448 LaunchServices`_LSCheckLSDServiceAccessForAuditToken + 153
    frame #9: 0x00007fff439c097a LaunchServices`_LSRegisterSelf + 64
    frame #10: 0x00007fff439b9a7c LaunchServices`_LSApplicationCheckIn + 5420
    frame #11: 0x00007fff40d7192c HIServices`_RegisterApplication + 4617
    frame #12: 0x00007fff40d7064c HIServices`GetCurrentProcess + 24
    frame #13: 0x00007fff417cf4ab HIToolbox`MenuBarInstance::GetAggregateUIMode(unsigned int*, unsigned int*) + 63
    frame #14: 0x00007fff417cf435 HIToolbox`MenuBarInstance::IsVisible() + 51
    frame #15: 0x00007fff3fa71197 AppKit`_NSInitializeAppContext + 35
    frame #16: 0x00007fff3fa70590 AppKit`-[NSApplication init] + 443
    frame #17: 0x00007fff3fa701e6 AppKit`+[NSApplication sharedApplication] + 138
    frame #18: 0x00007fff3fa718b2 AppKit`NSApplicationMain + 356
    frame #19: 0x0000000100001c04 iHex`___lldb_unnamed_symbol1$$iHex + 52
(lldb) 
```
After this, the application interface is rapidly built by the rest of the components and the app starts sandboxed.

### Acknowledgements

Thank you a lot for reading through this! I hope you find it useful. In the end, I'd like to thank Jonathan Levin for both his presentation at HITBGSEC 2016 about the Sandbox and for his marvelous \*OS Internals Volume III book which is pretty much the main resources I've studied to understand the sandbox and to be able to write this article. It's Jonathan whom you shall thank for the research and the effort put into the uncovering of Apple Sandbox' inner workings and if you can buy his \*OS Internals series, please do - they are absolutely fantastic books with tons of research put into iOS, macOS, watchOS and tvOS.

### Bibliography
<ul>
  <li>2016 J. LEVIN, <i><a href="https://www.amazon.com/MacOS-iOS-Internals-III-Insecurity/dp/0991055535/ref=as_sl_pc_qf_sp_asin_til?tag=newosxbookcom-20&linkCode=w00&linkId=0b61c945365c9c37cd3cf88f10a5f629&creativeASIN=0991055535">*OS Internals Volume III Security & Insecurity</a></i>, NY, USA, TechnoloGeeks</li>
  <li>2016 J. LEVIN, <i>The Apple Sandbox: Deeper Into The Quagmire</i>, presentation at HITBGSEC 2016 conference</li>
  <li><a href="https://developer.apple.com/library/archive/documentation/Security/Conceptual/AppSandboxDesignGuide/AboutAppSandbox/AboutAppSandbox.html"><i>Apple Sandbox Design Guide</i></a>, accessed on December 27 2018</li>
  <li><a href="https://developer.apple.com/library/archive/documentation/Security/Conceptual/AppSandboxDesignGuide/AppSandboxInDepth/AppSandboxInDepth.html"><i>App Sandbox In Depth</i></a>, accessed on December 27 2018</li>
  <li>2016 D. Thiel, <i>iOS Application Security The Definitive Guide for Hackers and Developers</i>, No Starch Press, San Francisco, USA</li>
</ul>  

### Contact me
<ul>
  <li>Twitter: <a href="https://twitter.com/FCE365">GeoSn0w (@FCE365)</a></li>
  <li>YouTube: <a href="https://youtube.com/fce365official">F.C.E. 365 TV- iDevice Central</a></li>
</ul>


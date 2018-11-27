
The Jailbreaking process has long been a mysterious process where the iOS system suddenly gets unlocked out of Apple's shackles after running an application for a few seconds. For a very long time, exactly what happened during the runtime of that application was largely unknown and even today as of iOS 11 (12 actually), the end-user (be that casual user, eta folk, reditter or nagger) remains largely oblivious about the processes going on. In this blog post, I am going to try to explain the main elements of a jailbreak as they were implemented and used historically. This post is not all-encompassing and various jailbreak tools for various iOS versions may use different patches and techniques, but they do boil down mostly to what you are about to read.

### Why Jailbreak?
The nomenclature of the process likely comes from the Apple's "Jailed" approach. Applications and users are bound to use only what Apple provides which is a fraction of what the device is capable of. Breaking this Jail of restrictions is the scope of the entire Jailbreak Process.

### For the eta folk, reditter, nagger, et. al.
No, Cydia has nothing to do with Jailbreaking itself. Cydia is a byproduct of the jailbreak "community" and a jailbreak is not considered a jailbreak just because it has Cydia, just like a jailbreak that lacks Cydia is still a jailbreak. What differs is the target audience (or user). 

Cydia is a GUI (Graphical User Interface) application which uses <code class="high">dpkg</code> and <code class="high">apt</code> (amongst others) in the background to install .deb (Debian) Packages. These packages follow a very strict (way too strict if you ask me) format that I will be discussing later. As the astute might have figured out, you don't need Cydia to install packages. Since Cydia relies on apt and dpkg (etc), you can simply use these binaries via <code class="high">SSH</code> or through a mobile terminal application on the device. Cydia is just there to make this process as fool-proof as possible. Sometimes it fails.

So yes, my iOS 11.3.x/11.2.x Jailbreak, Osiris, released long before Electra was even a thing, was and is a jailbreak even though I never bundled any GUI installer (Cydia or such) with it. The same thing applies for LiberiOS by Jonathan Levin (iOS 11 to 11.1.2) which was maybe the most stable iOS 11 Jailbreak to date. These jailbreaks are mostly destined for researchers and power users and not the random eta folk (who usually flames at the lack of Cydia).

### So how does it work?
Before being able to open Cydia, Installer 5, Icy Project, or an SSH on the device, the jailbreak has to run.
The stages of a jailbreak differ depending on the iOS version and the device. It used to be less reliant on the device type, but with the advent of KPP (Kernel Patch Protector) on iOS 9.0 and KTRR (allegedly Kernel Text Readonly Region) on iOS 10, that has become a thing more and more. For example, devices pre-iPhone 7 use KPP which is a software protection running in EL3 (ARM Exception LEVEL 3), but the iPhone 7 and newer are using KTRR which is hardware-based. In this case, a jailbreak containing only a KPP bypass (like Yalu) would not work on iPhone 7 and newer because KPP itself isn't a thing there. Yalu, however, supports iPhone 7 thanks to @xerub and his "KPPLess" aproach. Normally, for these devices a KTRR bypass of sorts is required, as siguza has explained in his write-up aptly called <a href="http://siguza.github.io/KTRR/">KTRR</a>. So this way, the jailbreak tool has to know very well what kind of device it deals with.

### Jailbreak History? Look no further than Pangu for iOS 7.x.x

Before anything can happen on the device, the jailbreak payload has to be somehow deployed to the device. This may sound very trivial today because anybody has access to a free Apple Developer Account to sign an IPA file and install it on the device with Cydia Impactor or something akin to this, but it did not use to be this simple. This self-signing with Provisioning Profiles was introduced to the masses by Apple by iOS 9.0 which is not even that far back in the jailbreak history.

Long before that was a thing, <code class="high">CodeSign</code> was bypassed in very interesting ways by the highly skilled Jailbreak teams which are unfortunately long gone now. If you still have an iPhone 4 just collecting dust around, chances are you are jailbroken with Pangu for iOS 7.1 - 7.1.2. The astute can easily see that since this is talking about iOS 7.1.x, self-signing with provisioning profiles for free and deploying the signed IPAs was not a thing. So what was their trick?

Pangu for iOS 7.1- 7.1.2 has its own Windows and macOS program that does the deployment for you. The application it installs, aptly called "Pangu", is signed with an enterprise certificate which existed at that point and was a powerful thing but it wasn't as easy to obtain on the black market as it is today (hence the advent of all these signing services like Ignition and AppValley).

Their certificate was, however, expired. The Pangu program on the computer instructed the user to set the date and the time of the device way back to a date in 2014 (June 2, 2014, to be more specific).

The dummy application is deployed by the Pangu program and its main purpose is to drop that sweet certificate. The IPA itself is actually part of the Pangu Windows / macOS binary itself. That can easily be spotted by using any disassembler (I use Jtool and IDA).
Jtool by Jonathan Levin has a dope feature which can produce HTML output(!!!) which is very useful for when I build write-ups for my blog. 

Here's how the Pangu binary on macOS looks like. See the extra segments?

```bash
  LC 00: LC_SEGMENT_64             Mem: 0x000000000-0x100000000    __PAGEZERO
  LC 01: LC_SEGMENT_64             Mem: 0x100000000-0x101e71000    __TEXT
    Mem: 0x100002370-0x1000292cf        __TEXT.__text    (Normal)
    Mem: 0x1000292d0-0x10002982e        __TEXT.__stubs    (Symbol Stubs)
    Mem: 0x100029830-0x10002a132        __TEXT.__stub_helper    (Normal)
    Mem: 0x10002a140-0x10002a690        __TEXT.__const    
    Mem: 0x10002a690-0x10002b914        __TEXT.__objc_methname    (C-String Literals)
    Mem: 0x10002b914-0x10002b9d5        __TEXT.__objc_classname    (C-String Literals)
    Mem: 0x10002b9d5-0x10002beb6        __TEXT.__objc_methtype    (C-String Literals)
    Mem: 0x10002bec0-0x10002e8d5        __TEXT.__cstring    (C-String Literals)
    Mem: 0x10002e8d6-0x10002e92e        __TEXT.__ustring    
    Mem: 0x10002e92e-0x10003dc04        __TEXT.__objc_cons1    
    Mem: 0x10003dc04-0x10029ed87        __TEXT.__objc_cons2    ; Yeee, see this!
    Mem: 0x10029ed87-0x1002b71a9        __TEXT.__objc_cons3    
    Mem: 0x1002b71a9-0x100f11a36        __TEXT.__objc_cons4    
    Mem: 0x100f11a36-0x10160e0ca        __TEXT.__objc_cons5    
    Mem: 0x10160e0ca-0x101dd6e3f        __TEXT.__objc_cons6    
    Mem: 0x101dd6e3f-0x101dd7152        __TEXT.__objc_cons7    
    Mem: 0x101dd7152-0x101dd7a17        __TEXT.__objc_cons8    
    Mem: 0x101dd7a17-0x101e45a6e        __TEXT.__objc_cons9    
    Mem: 0x101e45a6e-0x101e57e74        __TEXT.__objc_cons10    
    Mem: 0x101e57e74-0x101e69288        __TEXT.__objc_cons11    
    Mem: 0x101e69288-0x101e699e0        __TEXT.__unwind_info    
    Mem: 0x101e699e0-0x101e71000        __TEXT.__eh_frame    
  LC 02: LC_SEGMENT_64            Mem: 0x101e71000-0x101e75000    __DATA
    Mem: 0x101e71000-0x101e71028        __DATA.__program_vars    
    Mem: 0x101e71028-0x101e710b8        __DATA.__got    (Non-Lazy Symbol Ptrs)
    Mem: 0x101e710b8-0x101e710c8        __DATA.__nl_symbol_ptr    (Non-Lazy Symbol Ptrs)
    Mem: 0x101e710c8-0x101e717f0        __DATA.__la_symbol_ptr    (Lazy Symbol Ptrs)
    Mem: 0x101e717f0-0x101e717f8        __DATA.__mod_init_func    (Module Init Function Ptrs)
    Mem: 0x101e717f8-0x101e71800        __DATA.__mod_term_func    (Module Termination Function Ptrs)
    Mem: 0x101e71800-0x101e71b40        __DATA.__const    
    Mem: 0x101e71b40-0x101e71b60        __DATA.__objc_classlist    (Normal)
    Mem: 0x101e71b60-0x101e71b68        __DATA.__objc_nlclslist    (Normal)
    Mem: 0x101e71b68-0x101e71b78        __DATA.__objc_catlist    (Normal)
    Mem: 0x101e71b78-0x101e71ba0        __DATA.__objc_protolist    
    Mem: 0x101e71ba0-0x101e71ba8        __DATA.__objc_imageinfo    
    Mem: 0x101e71ba8-0x101e72f90        __DATA.__objc_const    
    Mem: 0x101e72f90-0x101e73590        __DATA.__objc_selrefs    (Literal Pointers)
    Mem: 0x101e73590-0x101e735a0        __DATA.__objc_protorefs    
    Mem: 0x101e735a0-0x101e736f8        __DATA.__objc_classrefs    (Normal)
    Mem: 0x101e736f8-0x101e73718        __DATA.__objc_superrefs    (Normal)
    Mem: 0x101e73718-0x101e738a8        __DATA.__objc_data    
    Mem: 0x101e738a8-0x101e73930        __DATA.__objc_ivar    
    Mem: 0x101e73930-0x101e74390        __DATA.__cfstring    
    Mem: 0x101e74390-0x101e746b8        __DATA.__data    
    Mem: 0x101e746c0-0x101e74b60        __DATA.__bss    (Zero Fill)
    Mem: 0x101e74b60-0x101e74b90        __DATA.__common    (Zero Fill)
LC 03: LC_SEGMENT_64          Mem: 0x101e75000-0x101eba000    __ui0
LC 04: LC_SEGMENT_64          Mem: 0x101eba000-0x101ebf000    __LINKEDIT
LC 05: LC_DYLD_INFO          
LC 06: LC_SYMTAB             
    Symbol table is at offset 0x1ebbc48 (32226376), 293 entries
    String table is at offset 0x1ebd610 (32232976), 4776 bytes
....
```

Do you see the <code class="high">__TEXT.__objc_cons2 section</code>?

If you do <code class="high">0x10029ed87 - 0x10003dc04 = 2494851 bytes (decimal) => 2.494851 Megabytes</code>.
That is hell of a big section. No wonder, It is the embedded IPA file. objc_cons1, objc_cons2 and objc_cons3 are all embedded parts of the jailbreak payload (the untether, plists, libraries etc).

In fact, let's not talk about it, let's see it! 

Jtool is a very powerful tool. It has the ability to extract whole sections from a binary. The command is <code class="high">jtool -e (extract) /path</code>.
If we do that to the Pangu binary we will get a new file called <code class="high">pangu.__TEXT.__objc_cons2</code> which so happens to be identified by the <code class="high">file(1)</code> as being a <code class="high">gzip compressed data, from Unix</code>, so a <code class="high">tar tvf</code> should be able to list the contents quite fine.
It can and it does.

```bash
Saigon:~ geosn0w$ /Users/geosn0w/Desktop/ToolChain/jtool/jtool -e __TEXT.__objc_cons2 /Users/geosn0w/Desktop/pangu.app/Contents/MacOS/pangu 
Requested section found at Offset 252932
Extracting __TEXT.__objc_cons2 at 252932, 2494851 (261183) bytes into pangu.__TEXT.__objc_cons2
Saigon:~ geosn0w$ file /Users/geosn0w/pangu.__TEXT.__objc_cons2
/Users/geosn0w/pangu.__TEXT.__objc_cons2: gzip compressed data, from Unix
Saigon:~ geosn0w$ tar tvf /Users/geosn0w/pangu.__TEXT.__objc_cons2 
drwxrwxrwx  0 0      0           0 Jun 27  2014 Payload/
drwxrwxrwx  0 0      0           0 Jun 27  2014 Payload/ipa1.app/
drwxrwxrwx  0 0      0           0 Jun 27  2014 Payload/ipa1.app/_CodeSignature/
-rwxrwxrwx  0 0      0        3638 Jun 27  2014 Payload/ipa1.app/_CodeSignature/CodeResources
-rwxrwxrwx  0 0      0       15112 Jun 27  2014 Payload/ipa1.app/AppIcon60x60@2x.png
-rwxrwxrwx  0 0      0       20753 Jun 27  2014 Payload/ipa1.app/AppIcon76x76@2x~ipad.png
-rwxrwxrwx  0 0      0        8017 Jun 27  2014 Payload/ipa1.app/AppIcon76x76~ipad.png
-rwxrwxrwx  0 0      0       75320 Jun 27  2014 Payload/ipa1.app/Assets.car
-rwxrwxrwx  0 0      0        7399 Jun 27  2014 Payload/ipa1.app/embedded.mobileprovision
drwxrwxrwx  0 0      0           0 Jun 27  2014 Payload/ipa1.app/en.lproj/
-rwxrwxrwx  0 0      0          74 Jun 27  2014 Payload/ipa1.app/en.lproj/InfoPlist.strings
-rwxrwxrwx  0 0      0        1955 Jun 27  2014 Payload/ipa1.app/Info.plist
-rwxrwxrwx  0 0      0      312208 Jun 27  2014 Payload/ipa1.app/ipa1
-rwxrwxrwx  0 0      0         968 Jun 27  2014 Payload/ipa1.app/ipa1-Info.plist
-rwxrwxrwx  0 0      0      235794 Jun 27  2014 Payload/ipa1.app/LaunchImage-700-568h@2x.png
-rwxrwxrwx  0 0      0      785321 Jun 27  2014 Payload/ipa1.app/LaunchImage-700-Landscape@2x~ipad.png
-rwxrwxrwx  0 0      0      261481 Jun 27  2014 Payload/ipa1.app/LaunchImage-700-Landscape~ipad.png
-rwxrwxrwx  0 0      0      660541 Jun 27  2014 Payload/ipa1.app/LaunchImage-700-Portrait@2x~ipad.png
-rwxrwxrwx  0 0      0      244644 Jun 27  2014 Payload/ipa1.app/LaunchImage-700-Portrait~ipad.png
-rwxrwxrwx  0 0      0      216627 Jun 27  2014 Payload/ipa1.app/LaunchImage-700@2x.png
-rwxrwxrwx  0 0      0           8 Jun 27  2014 Payload/ipa1.app/PkgInfo
-rwxrwxrwx  0 0      0         150 Jun 27  2014 Payload/ipa1.app/ResourceRules.plist
drwxrwxrwx  0 0      0           0 Jun 27  2014 Payload/ipa1.app/zh-Hans.lproj/
-rwxrwxrwx  0 0      0          73 Jun 27  2014 Payload/ipa1.app/zh-Hans.lproj/InfoPlist.strings
Saigon:~ geosn0w$ 

```
Doing a <code class="high">tar xvf</code> will extract the contents to a "Payload" folder. 
So the IPA file that gets deployed on the phone is actually ipa1. As you can see, there is a file called <code class="high">embedded.mobileprovision</code> which contains the enterprise certificate. If we Right-click on it and select "Get Info", Finder is capable to show us some information about the embedded certificate. As you can see, it belongs to "Hefei Bo Fang", whatever that is.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/46533169-a763df00-c871-11e8-884b-fa51df3b0f6e.png"/>
</p>

### Getting there...

As you can see, Pangu, like many other jailbreaks relied on developer certificate to bypass the CodeSign, but getting the IPA deployed to the device is not as easy as you may think. Nowadays we quickly fire Cydia Impactor, drag and drop the IPA, sign in and there we go. This wasn't the case until iOS 9.0, so Pangu had to do what other jailbreak teams before them did - use Apple against itself.

iTunes can easily communicate with the device and up until iTunes 12.x, iTunes was capable to handle iOS applications too. It was since stripped off this functionality but that hinted to the fact that one or more frameworks (or DLLs for the Windows folk) have to be able to create a connection to the device and perform application-related tasks. Of course, we are talking about AppleMobileDevice.(framework / dll). Shipped with iTunes and its driver packages, this framework was largely used in the jailbreaks before and it is still used by all these "Backup iOS / Photos / Contacts / Whatever" programs on Windows to communicate reliably with the device. The APIs are, of course, private but they were reversed to shit and beyond by multiple researchers. They were also recreated in the <code class="high">libimobiledevice</code> project.

As you can see, with that in place, Pangu could finally talk to the device and drop the payload at the right moment.
The rest follows an almost formulaic set of canonical patches I am going to discuss below.

Pangu was my desired example here because it is fairly new so it applies most of the following patches (compared to redsn0w etc) and also because it is one of the jailbreaks I have used myself a lot on an iPhone 4 I still happen to have.

I mostly gave it as an example so that you can see the difference between getting to bypass CodeSign back then vs getting to bypass CodeSign now. 

### Canonical Patches


I have created the following diagram which should (in theory) show the flow of most jailbreaks. Of course, the implementation and techniques would be different from iOS version to iOS version and some jailbreaks may do the actions in a totally different order.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/46557813-31836600-c8b9-11e8-9171-116a8ea7f939.png"/>
</p>

So, as you can see from the diagram, the most important step is getting on the device. You cannot do much from outside the device. The entry vector can be different from jailbreak to jailbreak. Nowadays, most jailbreaks including my Osiris, Coolstar & Co's Electra and Jonathan's LiberiOS use the IPA applications signed with a temporary certificate and deployed with either Xcode or Cydia Impactor (or a signing service) to the device. From there, the application is executed by the user and the exploit is triggered.

Other methods include but are not limited to WebKit exploits, mail exploits, etc. 
The WebKit ones are more common. <i>TotallyNotSpyware*</i> is a good example of an iOS 10.x to 10.3.3 64-Bit Jailbreak, and if we talk legacy, JailbreakMe series is probably the best example. These WebKit-based jailbreaks are usually deployed by accessing a website in Safari on the device. The website is crafted so that it exploits a webkit vulnerability (WebKit is at Safari's core), and thus gaining arbitrary code execution.

In the rest of this write-up, I will assume an IPA based Jailbreak like Osiris, LiberiOS or Electra. Also, this write-up assumes we already have a raw kernel exploit that gives us <code class="high">TFP0</code>, and the KPPless approach.

After the application has been successfully installed and can run, CodeSign is no longer a problem, at least for the initial stage. We still cannot run unsigned or fake-signed binaries, but at least we can run ourselves (the exploit application) without being killed by AMFI. However, the problem is that we are still limited by the SandBox. The SandBox keeps us from accessing anything outside our container, so no R/W permissions for us. All we can see is our own data, nothing more. That has to change. We have to bestow ourselves the might of ShaiHulud!

The SandBox is a kernel extension (KEXT) which ensures that you do not access more than you're supposed to access. By default, everything in /var/mobile/Containers is sandboxed. Apple's own default applications are also sandboxed. When you install an application via Xcode, the App Store or via Cydia Impactor, you are automatically placing the application in <code class="high">/var/mobile/Containers/Bundle/Application/UUID of the APP</code>. There is no other way to install an app, so our jailbreak application will be sandboxed by default, no matter what.

So how do apps have access to the services required in order for them to run?! How can Deezer connect to my Bluetooth headset? How can YouTube decode frames? How can Twitter send me notifications? It's simple, through APIs. These APIs allow your containerized app to communicate in a controlled manner with Core Services (<code class="high">bluetoothd</code>, <code class="high">wifid</code>, <code class="high">mediaserverd</code>, etc) which are also sandboxed, and these Core Services talk with the kexts / kernel through <code class="high">IOKit</code>. So no, you don't directly talk to the kernel. The following diagram should help you see how this looks like.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/46547236-4fd96980-c899-11e8-8d48-1947418eb777.png"/>
</p>

Of course, as an Application on iOS, not only you cannot see the File System and the User Data, but you are also largely oblivious of the existence of any other applications. Yes, through some APIs you can pass files / data to another application if that other application is registered as one that accepts to handle such input, but even then, you as an application don't know anything about the existence of the other app and it is through the series of APIs provided by iOS that you pass your .PDF file, for example, to be opened in whatever application. 

Some applications also provide uri schemes for you to communicate with them. Let's say you are in Chrome on iOS and you find a phone number to a company you wanna call. If you press it, you get asked if you really wanna call, and then you go straight to the Call app from iOS and the number is already being dialed. How? 

Simple. The "Phone" application has registered an uri scheme that looks like this: <code class="high">tel://XXXXXXXXXXXX</code> so if you add <code class="high">tel://5552220001</code> to an HTML page and click it in Safari, the iOS knows who to open to handle that. Same goes for Facebook, WhatsApp, etc.

To use the URI scheme from your app, you just have to call the right UIApplication method. That is 

```swift
UIApplication.shared.open(url, options: [:], completionHandler: nil)
```

So does that mean you bypassed SandBox because you were able to pass data to another app and open it? Not even close. All you did was through a very well controlled set of APIs. You don't know that Phone app exists. iOS knows.
Here's how SandBoxing feels for an application.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/46547949-9760f500-c89b-11e8-966a-fef2dbfb28d9.png"/>
</p>

SandBox escaping can be done in multiple ways.

Osiris Jailbreak uses QiLin's built-in SandBox escape which is called "ShaiHulud", a Dune reference.

QiLin (and therefore LiberiOS and Osiris Jailbreak) escape the SandBox by assuming Kernel's credentials. Not only that, but since now we have the Kernel's credentials, we have access to whatever we want including syscalls like execve(), fork(), and posix_spawn()! Jonathan Levin has explained very well how QiLin proceeds in escaping the sandbox and assuming the kernel creds <a href="http://newosxbook.com/QiLin/qilin.pdf"> in this write-up</a>, part of the <code class="high"><a href="https://www.amazon.com/MacOS-iOS-Internals-III-Insecurity/dp/0991055535/ref=as_sl_pc_qf_sp_asin_til?tag=newosxbookcom-20&linkCode=w00&linkId=0b61c945365c9c37cd3cf88f10a5f629&creativeASIN=0991055535">*OS Internals Volume III</a></code>

Of course, QiLin saves our application's credentials and restores them before exiting, that is to prevent creating panics due to the various locks that govern the kernel creds (and by increasing the wrong reference counters).

Electra for iOS 11.2.x -> iOS 11.3.1 also uses the same kernel credential method for sandbox bypass and other privs.

### Running fake-signed binaries, the Alpha and Omega of a Jailbreak
A Jailbreak doesn't provide much of a value if it doesn't come with a binary pack, part of what is called the "bootstrap". This binary pack can often contain a long set of command-line (CLI) binaries that one can use either programatically or via an SSH connection. These binaries include but are not limited to binaries that: rename, move, remove files, SSH clients like dropbear and their dependencies, various shells like <code class="high">ZSH</code>, archive utilities like <code class="high">gzip</code> and the standard <code class="high">chown</code>, <code class="high">chmod</code> and <code class="high">chflags</code> for messing with files permissions and such.

<b>NOTA BENE! Please do not confuse <code class="high">bootstrap</code> with <code class="high">bin pack</code> or <code class="high">base binaries</code>. The base binaries are the jailbreak-specific daemons or additional binaries and may change from a jailbreak to another. The <code class="high">bin pack</code> is part of a <code class="high">Boostrap</code>, and a <code class="high">Bootstrap</code> contains Cydia, the CLI tools, Cydia dependencies and any other support files for it. Just like the <code class="high">base binaries</code>, the content of the <code class="high">Bootstrap</code> can also vary. For example, pwn20wnd's version of Osiris he rewrote from scratch doesn't contain Cydia in its bootstrap but it contains Filza.</b>

Across the history of jailbreaks, various jailbreak teams have built their own binary packs in the .tar format which they deployed and extracted once they had access to the root file system which we discuss below.

On iOS 11.x which is 64-Bit, there is a very well made universal binary pack created by Jonathan Levin and published on <a href="http://newosxbook.com/tools/iOSBinaries.html">NewOSXBook</a> that can be used in any iOS 11 Jailbreak. The binpack contains a ton of binaries for various purposes, including an ARM compiled version of jtool to mess with the signatures and disassemble on the device.

The following is the content of the binpack by Jonathan Levin used in his LiberiOS Jailbreak for iOS 11.x and my Osiris Jailbreak for iOS 11.2.x

```bash
Saigon:~ geosn0w$ tar tvf /Users/geosn0w/Desktop/binpack64-256.tar.gz 
-rwxr-xr-x  0 morpheus staff   54736 Apr 25 17:55 amfidebilitate
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 ./._bin
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 bin/
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._cat
-rwxr-xr-x  0 morpheus staff   52672 Apr 25 17:45 bin/cat
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._launchctl
-rwxr-xr-x  0 morpheus staff  127488 Apr 25 17:45 bin/launchctl
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._pwd
-rwxr-xr-x  0 morpheus staff   50944 Apr 25 17:45 bin/pwd
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._sleep
-rwxr-xr-x  0 morpheus staff   50736 Apr 25 17:45 bin/sleep
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._stty
-rwxr-xr-x  0 morpheus staff   53984 Apr 25 17:45 bin/stty
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._date
-rwxr-xr-x  0 morpheus staff   53952 Apr 25 17:45 bin/date
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._bash
-rwxr-xr-x  0 morpheus staff 1038208 Apr 25 17:45 bin/bash
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._kill
-rwxr-xr-x  0 morpheus staff   51376 Apr 25 17:45 bin/kill
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._sh
-rwxr-xr-x  0 morpheus staff  669664 Apr 25 17:45 bin/sh
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._dd
-rwxr-xr-x  0 morpheus staff   70769 Apr 25 17:45 bin/dd
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._mkdir
-rwxr-xr-x  0 morpheus staff   51312 Apr 25 17:45 bin/mkdir
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._hostname
-rwxr-xr-x  0 morpheus staff   50960 Apr 25 17:45 bin/hostname
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._rmdir
-rwxr-xr-x  0 morpheus staff   50912 Apr 25 17:45 bin/rmdir
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._mv
-rwxr-xr-x  0 morpheus staff   53056 Apr 25 17:45 bin/mv
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._ln
-rwxr-xr-x  0 morpheus staff   51936 Apr 25 17:45 bin/ln
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._ls
-rwxr-xr-x  0 morpheus staff   74656 Apr 25 17:45 bin/ls
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._cp
-rwxr-xr-x  0 morpheus staff   53872 Apr 25 17:45 bin/cp
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._sync
-rwxr-xr-x  0 morpheus staff   50448 Apr 25 17:45 bin/sync
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._zsh
-rwxr-xr-x  0 morpheus staff  669664 Apr 25 17:45 bin/zsh
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._chmod
-rwxr-xr-x  0 morpheus staff   55328 Apr 25 17:45 bin/chmod
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 bin/._rm
-rwxr-xr-x  0 morpheus staff   53392 Apr 25 17:45 bin/rm
-rw-r--r--  0 morpheus staff     271 Apr 25 17:45 default.ent
-rwxr-xr-x  0 morpheus staff     178 Apr 11 22:36 ./._etc
drwxr-xr-x  0 morpheus staff       0 Apr 11 22:36 etc/
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 etc/._ssl
lrwxr-xr-x  0 morpheus staff       0 Dec 20  2017 etc/ssl -> ../usr/
-r--r--r--  0 morpheus staff     178 Apr 11 22:36 etc/._zshrc
-r--r--r--  0 morpheus staff    2770 Apr 11 22:36 etc/zshrc
-rwxr-xr-x  0 morpheus staff     178 Mar  4  2016 etc/._dropbear
drwxr-xr-x  0 morpheus staff       0 Mar  4  2016 etc/dropbear/
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 etc/._profile
-rw-r--r--  0 morpheus staff      92 Mar  4  2016 etc/profile
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 etc/._apt
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 etc/apt/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 etc/._alternatives
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 etc/alternatives/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 etc/._dpkg
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 etc/dpkg/
-rw-r--r--  0 morpheus staff     178 Jan 18  2018 etc/._motd
-rw-r--r--  0 morpheus staff    1012 Jan 18  2018 etc/motd
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 etc/dpkg/._dselect.cfg.d
drwxr-xr-x  0 morpheus staff       0 Dec 20  2017 etc/dpkg/dselect.cfg.d/
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 etc/dpkg/._dpkg.cfg.d
drwxr-xr-x  0 morpheus staff       0 Dec 20  2017 etc/dpkg/dpkg.cfg.d/
-rw-r--r--  0 morpheus staff     178 Dec 20  2017 etc/alternatives/._README
-rw-r--r--  0 morpheus staff     100 Dec 20  2017 etc/alternatives/README
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 etc/apt/._sources.list.d
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 etc/apt/sources.list.d/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 etc/apt/._trusted.gpg.d
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 etc/apt/trusted.gpg.d/
-rw-r--r--  0 morpheus staff     178 Feb  3  2017 etc/apt/trusted.gpg.d/._zodttd.gpg
-rw-r--r--  0 morpheus staff    1158 Feb  3  2017 etc/apt/trusted.gpg.d/zodttd.gpg
-rw-r--r--  0 morpheus staff     178 Feb  3  2017 etc/apt/trusted.gpg.d/._bigboss.gpg
-rw-r--r--  0 morpheus staff    1164 Feb  3  2017 etc/apt/trusted.gpg.d/bigboss.gpg
-rw-r--r--  0 morpheus staff     178 Feb  3  2017 etc/apt/trusted.gpg.d/._modmyi.gpg
-rw-r--r--  0 morpheus staff    1180 Feb  3  2017 etc/apt/trusted.gpg.d/modmyi.gpg
-rw-r--r--  0 morpheus staff     178 Feb  3  2017 etc/apt/trusted.gpg.d/._saurik.gpg
-rw-r--r--  0 morpheus staff    1172 Feb  3  2017 etc/apt/trusted.gpg.d/saurik.gpg
-rw-r--r--  0 morpheus staff     178 Feb  3  2017 etc/apt/sources.list.d/._cydia.list
-rw-r--r--  0 morpheus staff       0 Feb  3  2017 etc/apt/sources.list.d/cydia.list
-rw-r--r--  0 morpheus staff     178 Feb  3  2017 etc/apt/sources.list.d/._saurik.list
-rw-r--r--  0 morpheus staff     227 Feb  3  2017 etc/apt/sources.list.d/saurik.list
-rwxr-xr-x  0 morpheus staff     178 Jan  3  2018 ./._makeMeAtHome.sh
-rwxr-xr-x  0 morpheus staff     729 Jan  3  2018 makeMeAtHome.sh
-rwxr-xr-x  0 morpheus staff     952 Mar 19  2018 removeMe.sh
-rwxr-xr-x  0 morpheus staff     178 Apr 25 18:24 ./._sbin
drwxr-xr-x  0 morpheus staff       0 Apr 25 18:24 sbin/
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 sbin/._md5
-rwxr-xr-x  0 morpheus staff   54016 Apr 25 17:45 sbin/md5
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 sbin/._ping
-rwxr-xr-x  0 morpheus staff   72528 Apr 25 17:45 sbin/ping
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 sbin/._shutdown
-rwxr-xr-x  0 morpheus staff   54704 Apr 25 17:45 sbin/shutdown
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 sbin/._ifconfig
-rwxr-xr-x  0 morpheus staff  111696 Apr 25 17:45 sbin/ifconfig
-rwxr-xr-x  0 morpheus staff   53616 Apr 25 18:24 sbin/umount
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:53 sbin/._kextunload
-rwxr-xr-x  0 morpheus staff   76256 Apr 25 17:53 sbin/kextunload
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 sbin/._mknod
-rwxr-xr-x  0 morpheus staff   51504 Apr 25 17:45 sbin/mknod
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 sbin/._dmesg
-rwxr-xr-x  0 morpheus staff   50912 Apr 25 17:45 sbin/dmesg
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 ./._usr
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/._bin
drwxr-xr-x  0 morpheus staff       0 Apr 25 17:46 usr/bin/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/._sbin
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/sbin/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/._local
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/local/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/._share
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/share/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/share/._terminfo
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/share/terminfo/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/share/terminfo/._61
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/share/terminfo/61/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/share/terminfo/._73
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/share/terminfo/73/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/share/terminfo/._6c
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/share/terminfo/6c/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/share/terminfo/._76
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/share/terminfo/76/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/share/terminfo/._78
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/share/terminfo/78/
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/78/._xterm-256color
-rw-r--r--  0 morpheus staff    3322 Sep  9  2014 usr/share/terminfo/78/xterm-256color
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-putty
-rw-r--r--  0 morpheus staff    1199 Mar  4  2016 usr/share/terminfo/76/vt100-putty
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-nav-w
-rw-r--r--  0 morpheus staff    1093 Mar  4  2016 usr/share/terminfo/76/vt100-nav-w
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-s
-rw-r--r--  0 morpheus staff    1272 Mar  4  2016 usr/share/terminfo/76/vt100-s
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100+
-rw-r--r--  0 morpheus staff    1657 Mar  4  2016 usr/share/terminfo/76/vt100+
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100nam
-rw-r--r--  0 morpheus staff    1190 Mar  4  2016 usr/share/terminfo/76/vt100nam
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-vb
-rw-r--r--  0 morpheus staff    1207 Mar  4  2016 usr/share/terminfo/76/vt100-vb
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100+enq
-rw-r--r--  0 morpheus staff     682 Mar  4  2016 usr/share/terminfo/76/vt100+enq
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-s-top
-rw-r--r--  0 morpheus staff    1272 Mar  4  2016 usr/share/terminfo/76/vt100-s-top
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-nam-w
-rw-r--r--  0 morpheus staff    1221 Mar  4  2016 usr/share/terminfo/76/vt100-nam-w
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100+fnkeys
-rw-r--r--  0 morpheus staff     450 Mar  4  2016 usr/share/terminfo/76/vt100+fnkeys
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-w
-rw-r--r--  0 morpheus staff    1203 Mar  4  2016 usr/share/terminfo/76/vt100-w
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100
-rw-r--r--  0 morpheus staff    1194 Mar  4  2016 usr/share/terminfo/76/vt100
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-w-nav
-rw-r--r--  0 morpheus staff    1093 Mar  4  2016 usr/share/terminfo/76/vt100-w-nav
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-bot-s
-rw-r--r--  0 morpheus staff    1256 Mar  4  2016 usr/share/terminfo/76/vt100-bot-s
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-w-nam
-rw-r--r--  0 morpheus staff    1221 Mar  4  2016 usr/share/terminfo/76/vt100-w-nam
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100+pfkeys
-rw-r--r--  0 morpheus staff     422 Mar  4  2016 usr/share/terminfo/76/vt100+pfkeys
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-top-s
-rw-r--r--  0 morpheus staff    1272 Mar  4  2016 usr/share/terminfo/76/vt100-top-s
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-nav
-rw-r--r--  0 morpheus staff    1059 Mar  4  2016 usr/share/terminfo/76/vt100-nav
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-nam
-rw-r--r--  0 morpheus staff    1190 Mar  4  2016 usr/share/terminfo/76/vt100-nam
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-bm-o
-rw-r--r--  0 morpheus staff    1207 Mar  4  2016 usr/share/terminfo/76/vt100-bm-o
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100+keypad
-rw-r--r--  0 morpheus staff     368 Mar  4  2016 usr/share/terminfo/76/vt100+keypad
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-am
-rw-r--r--  0 morpheus staff    1194 Mar  4  2016 usr/share/terminfo/76/vt100-am
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-s-bot
-rw-r--r--  0 morpheus staff    1256 Mar  4  2016 usr/share/terminfo/76/vt100-s-bot
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-w-am
-rw-r--r--  0 morpheus staff    1203 Mar  4  2016 usr/share/terminfo/76/vt100-w-am
-rw-r--r--  0 morpheus staff     178 Mar  4  2016 usr/share/terminfo/76/._vt100-bm
-rw-r--r--  0 morpheus staff    1201 Mar  4  2016 usr/share/terminfo/76/vt100-bm
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/6c/._linux-lat
-rw-r--r--  0 morpheus staff    1782 Sep  9  2014 usr/share/terminfo/6c/linux-lat
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/6c/._linux-koi8r
-rw-r--r--  0 morpheus staff    1774 Sep  9  2014 usr/share/terminfo/6c/linux-koi8r
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/6c/._linux-vt
-rw-r--r--  0 morpheus staff    1652 Sep  9  2014 usr/share/terminfo/6c/linux-vt
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/6c/._linux-basic
-rw-r--r--  0 morpheus staff    1626 Sep  9  2014 usr/share/terminfo/6c/linux-basic
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/6c/._linux
-rw-r--r--  0 morpheus staff    1740 Sep  9  2014 usr/share/terminfo/6c/linux
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/6c/._linux-c-nc
-rw-r--r--  0 morpheus staff    1726 Sep  9  2014 usr/share/terminfo/6c/linux-c-nc
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/6c/._linux2.6.26
-rw-r--r--  0 morpheus staff    1752 Sep  9  2014 usr/share/terminfo/6c/linux2.6.26
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/6c/._linux-c
-rw-r--r--  0 morpheus staff    2080 Sep  9  2014 usr/share/terminfo/6c/linux-c
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/6c/._linux-m
-rw-r--r--  0 morpheus staff    1730 Sep  9  2014 usr/share/terminfo/6c/linux-m
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/6c/._linux-nic
-rw-r--r--  0 morpheus staff    1772 Sep  9  2014 usr/share/terminfo/6c/linux-nic
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/6c/._linux-koi8
-rw-r--r--  0 morpheus staff    1768 Sep  9  2014 usr/share/terminfo/6c/linux-koi8
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen-16color
-rw-r--r--  0 morpheus staff    1990 Sep  9  2014 usr/share/terminfo/73/screen-16color
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen2
-rw-r--r--  0 morpheus staff     585 Sep  9  2014 usr/share/terminfo/73/screen2
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen3
-rw-r--r--  0 morpheus staff     630 Sep  9  2014 usr/share/terminfo/73/screen3
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen-16color-bce-s
-rw-r--r--  0 morpheus staff    2030 Sep  9  2014 usr/share/terminfo/73/screen-16color-bce-s
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen-256color-bce
-rw-r--r--  0 morpheus staff    1840 Sep  9  2014 usr/share/terminfo/73/screen-256color-bce
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen.rxvt
-rw-r--r--  0 morpheus staff    2082 Sep  9  2014 usr/share/terminfo/73/screen.rxvt
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen.xterm-r6
-rw-r--r--  0 morpheus staff    1503 Sep  9  2014 usr/share/terminfo/73/screen.xterm-r6
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen-w
-rw-r--r--  0 morpheus staff    1566 Sep  9  2014 usr/share/terminfo/73/screen-w
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen.xterm-xfree86
-rw-r--r--  0 morpheus staff    3263 Sep  9  2014 usr/share/terminfo/73/screen.xterm-xfree86
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen-16color-s
-rw-r--r--  0 morpheus staff    2020 Sep  9  2014 usr/share/terminfo/73/screen-16color-s
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen.linux
-rw-r--r--  0 morpheus staff    1710 Sep  9  2014 usr/share/terminfo/73/screen.linux
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen-256color-bce-s
-rw-r--r--  0 morpheus staff    1866 Sep  9  2014 usr/share/terminfo/73/screen-256color-bce-s
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen
-rw-r--r--  0 morpheus staff    1550 Sep  9  2014 usr/share/terminfo/73/screen
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen-bce
-rw-r--r--  0 morpheus staff    1562 Sep  9  2014 usr/share/terminfo/73/screen-bce
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen-256color-s
-rw-r--r--  0 morpheus staff    1856 Sep  9  2014 usr/share/terminfo/73/screen-256color-s
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen.mlterm
-rw-r--r--  0 morpheus staff    2590 Sep  9  2014 usr/share/terminfo/73/screen.mlterm
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen-s
-rw-r--r--  0 morpheus staff    1584 Sep  9  2014 usr/share/terminfo/73/screen-s
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen.teraterm
-rw-r--r--  0 morpheus staff    1548 Sep  9  2014 usr/share/terminfo/73/screen.teraterm
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen-16color-bce
-rw-r--r--  0 morpheus staff    2002 Sep  9  2014 usr/share/terminfo/73/screen-16color-bce
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen.xterm-new
-rw-r--r--  0 morpheus staff    3263 Sep  9  2014 usr/share/terminfo/73/screen.xterm-new
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen-256color
-rw-r--r--  0 morpheus staff    1828 Sep  9  2014 usr/share/terminfo/73/screen-256color
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/73/._screen+fkeys
-rw-r--r--  0 morpheus staff     474 Sep  9  2014 usr/share/terminfo/73/screen+fkeys
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi80x50-mono
-rw-r--r--  0 morpheus staff    1264 Sep  9  2014 usr/share/terminfo/61/ansi80x50-mono
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+idl1
-rw-r--r--  0 morpheus staff     138 Sep  9  2014 usr/share/terminfo/61/ansi+idl1
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansil
-rw-r--r--  0 morpheus staff    1502 Sep  9  2014 usr/share/terminfo/61/ansil
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+idc
-rw-r--r--  0 morpheus staff     263 Sep  9  2014 usr/share/terminfo/61/ansi+idc
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansiw
-rw-r--r--  0 morpheus staff    1459 Sep  9  2014 usr/share/terminfo/61/ansiw
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi80x30
-rw-r--r--  0 morpheus staff    1496 Sep  9  2014 usr/share/terminfo/61/ansi80x30
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi-mono
-rw-r--r--  0 morpheus staff    1370 Sep  9  2014 usr/share/terminfo/61/ansi-mono
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+pp
-rw-r--r--  0 morpheus staff     295 Sep  9  2014 usr/share/terminfo/61/ansi+pp
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+idl
-rw-r--r--  0 morpheus staff     270 Sep  9  2014 usr/share/terminfo/61/ansi+idl
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansil-mono
-rw-r--r--  0 morpheus staff    1264 Sep  9  2014 usr/share/terminfo/61/ansil-mono
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi80x30-mono
-rw-r--r--  0 morpheus staff    1252 Sep  9  2014 usr/share/terminfo/61/ansi80x30-mono
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi80x25-raw
-rw-r--r--  0 morpheus staff    1459 Sep  9  2014 usr/share/terminfo/61/ansi80x25-raw
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+csr
-rw-r--r--  0 morpheus staff     349 Sep  9  2014 usr/share/terminfo/61/ansi+csr
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi-generic
-rw-r--r--  0 morpheus staff     733 Sep  9  2014 usr/share/terminfo/61/ansi-generic
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+sgr
-rw-r--r--  0 morpheus staff     368 Sep  9  2014 usr/share/terminfo/61/ansi+sgr
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+cup
-rw-r--r--  0 morpheus staff      69 Sep  9  2014 usr/share/terminfo/61/ansi+cup
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi-emx
-rw-r--r--  0 morpheus staff    1582 Sep  9  2014 usr/share/terminfo/61/ansi-emx
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+sgrbold
-rw-r--r--  0 morpheus staff     463 Sep  9  2014 usr/share/terminfo/61/ansi+sgrbold
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+sgrul
-rw-r--r--  0 morpheus staff     143 Sep  9  2014 usr/share/terminfo/61/ansi+sgrul
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi80x60-mono
-rw-r--r--  0 morpheus staff    1252 Sep  9  2014 usr/share/terminfo/61/ansi80x60-mono
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+sgrso
-rw-r--r--  0 morpheus staff     139 Sep  9  2014 usr/share/terminfo/61/ansi+sgrso
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi
-rw-r--r--  0 morpheus staff    1481 Sep  9  2014 usr/share/terminfo/61/ansi
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi-color-2-emx
-rw-r--r--  0 morpheus staff    1580 Sep  9  2014 usr/share/terminfo/61/ansi-color-2-emx
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansis-mono
-rw-r--r--  0 morpheus staff    1478 Sep  9  2014 usr/share/terminfo/61/ansis-mono
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi-color-3-emx
-rw-r--r--  0 morpheus staff    1577 Sep  9  2014 usr/share/terminfo/61/ansi-color-3-emx
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansisysk
-rw-r--r--  0 morpheus staff    1518 Sep  9  2014 usr/share/terminfo/61/ansisysk
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi43m
-rw-r--r--  0 morpheus staff     735 Sep  9  2014 usr/share/terminfo/61/ansi43m
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi-mtabs
-rw-r--r--  0 morpheus staff     444 Sep  9  2014 usr/share/terminfo/61/ansi-mtabs
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+sgrdim
-rw-r--r--  0 morpheus staff     463 Sep  9  2014 usr/share/terminfo/61/ansi+sgrdim
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi80x25
-rw-r--r--  0 morpheus staff    1502 Sep  9  2014 usr/share/terminfo/61/ansi80x25
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+erase
-rw-r--r--  0 morpheus staff      55 Sep  9  2014 usr/share/terminfo/61/ansi+erase
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+rep
-rw-r--r--  0 morpheus staff     286 Sep  9  2014 usr/share/terminfo/61/ansi+rep
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansis
-rw-r--r--  0 morpheus staff    1502 Sep  9  2014 usr/share/terminfo/61/ansis
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi80x50
-rw-r--r--  0 morpheus staff    1502 Sep  9  2014 usr/share/terminfo/61/ansi80x50
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+tabs
-rw-r--r--  0 morpheus staff     306 Sep  9  2014 usr/share/terminfo/61/ansi+tabs
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+local1
-rw-r--r--  0 morpheus staff      80 Sep  9  2014 usr/share/terminfo/61/ansi+local1
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi80x60
-rw-r--r--  0 morpheus staff    1496 Sep  9  2014 usr/share/terminfo/61/ansi80x60
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+rca
-rw-r--r--  0 morpheus staff     308 Sep  9  2014 usr/share/terminfo/61/ansi+rca
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi-mini
-rw-r--r--  0 morpheus staff     418 Sep  9  2014 usr/share/terminfo/61/ansi-mini
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+enq
-rw-r--r--  0 morpheus staff     685 Sep  9  2014 usr/share/terminfo/61/ansi+enq
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi-nt
-rw-r--r--  0 morpheus staff     476 Sep  9  2014 usr/share/terminfo/61/ansi-nt
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi77
-rw-r--r--  0 morpheus staff     543 Sep  9  2014 usr/share/terminfo/61/ansi77
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi-mr
-rw-r--r--  0 morpheus staff     377 Sep  9  2014 usr/share/terminfo/61/ansi-mr
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi80x43-mono
-rw-r--r--  0 morpheus staff    1252 Sep  9  2014 usr/share/terminfo/61/ansi80x43-mono
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi.sys
-rw-r--r--  0 morpheus staff    1257 Sep  9  2014 usr/share/terminfo/61/ansi.sys
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi.sys-old
-rw-r--r--  0 morpheus staff    1255 Sep  9  2014 usr/share/terminfo/61/ansi.sys-old
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi.sysk
-rw-r--r--  0 morpheus staff    1518 Sep  9  2014 usr/share/terminfo/61/ansi.sysk
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi80x25-mono
-rw-r--r--  0 morpheus staff    1478 Sep  9  2014 usr/share/terminfo/61/ansi80x25-mono
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+inittabs
-rw-r--r--  0 morpheus staff     314 Sep  9  2014 usr/share/terminfo/61/ansi+inittabs
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+local
-rw-r--r--  0 morpheus staff     306 Sep  9  2014 usr/share/terminfo/61/ansi+local
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi-m
-rw-r--r--  0 morpheus staff    1370 Sep  9  2014 usr/share/terminfo/61/ansi-m
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi80x43
-rw-r--r--  0 morpheus staff    1496 Sep  9  2014 usr/share/terminfo/61/ansi80x43
-rw-r--r--  0 morpheus staff     178 Sep  9  2014 usr/share/terminfo/61/._ansi+arrows
-rw-r--r--  0 morpheus staff     222 Sep  9  2014 usr/share/terminfo/61/ansi+arrows
-rwxr-xr-x  0 morpheus staff     178 Apr 25 19:23 usr/local/._bin
drwxr-xr-x  0 morpheus staff       0 Apr 25 19:23 usr/local/bin/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/local/._lib
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/local/lib/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/local/lib/._zsh
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/local/lib/zsh/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/local/lib/zsh/._5.0.8
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/local/lib/zsh/5.0.8/
-rwxr-xr-x  0 morpheus staff     178 Mar 18  2018 usr/local/lib/zsh/5.0.8/._zsh
drwxr-xr-x  0 morpheus staff       0 Mar 18  2018 usr/local/lib/zsh/5.0.8/zsh/
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._termcap.so
-rwxr-xr-x  0 morpheus staff   51968 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/termcap.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._zleparameter.so
-rwxr-xr-x  0 morpheus staff   51424 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/zleparameter.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._example.so
-rwxr-xr-x  0 morpheus staff   51728 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/example.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._tcp.so
-rwxr-xr-x  0 morpheus staff   52832 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/tcp.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._newuser.so
-rwxr-xr-x  0 morpheus staff   50992 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/newuser.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._deltochar.so
-rwxr-xr-x  0 morpheus staff   51296 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/deltochar.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._complete.so
-rwxr-xr-x  0 morpheus staff  157488 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/complete.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._mapfile.so
-rwxr-xr-x  0 morpheus staff   51936 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/mapfile.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._stat.so
-rwxr-xr-x  0 morpheus staff   52224 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/stat.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._compctl.so
-rwxr-xr-x  0 morpheus staff   94992 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/compctl.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._zselect.so
-rwxr-xr-x  0 morpheus staff   51936 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/zselect.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._parameter.so
-rwxr-xr-x  0 morpheus staff   72032 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/parameter.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._datetime.so
-rwxr-xr-x  0 morpheus staff   52320 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/datetime.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._socket.so
-rwxr-xr-x  0 morpheus staff   51696 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/socket.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._terminfo.so
-rwxr-xr-x  0 morpheus staff   51968 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/terminfo.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._clone.so
-rwxr-xr-x  0 morpheus staff   51792 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/clone.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._regex.so
-rwxr-xr-x  0 morpheus staff   51776 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/regex.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._attr.so
-rwxr-xr-x  0 morpheus staff   51488 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/attr.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._curses.so
-rwxr-xr-x  0 morpheus staff   56272 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/curses.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._files.so
-rwxr-xr-x  0 morpheus staff   53360 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/files.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._system.so
-rwxr-xr-x  0 morpheus staff   53056 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/system.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._zpty.so
-rwxr-xr-x  0 morpheus staff   54592 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/zpty.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._zle.so
-rwxr-xr-x  0 morpheus staff  284896 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/zle.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._mathfunc.so
-rwxr-xr-x  0 morpheus staff   53200 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/mathfunc.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._zutil.so
-rwxr-xr-x  0 morpheus staff   54880 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/zutil.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._complist.so
-rwxr-xr-x  0 morpheus staff   92064 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/complist.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._zftp.so
-rwxr-xr-x  0 morpheus staff   73568 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/zftp.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._cap.so
-rwxr-xr-x  0 morpheus staff   50736 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/cap.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._computil.so
-rwxr-xr-x  0 morpheus staff   89472 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/computil.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._zprof.so
-rwxr-xr-x  0 morpheus staff   51312 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/zprof.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/._langinfo.so
-rwxr-xr-x  0 morpheus staff   50992 Dec 20  2017 usr/local/lib/zsh/5.0.8/zsh/langinfo.so
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/bin/._wget
-rwxr-xr-x  0 morpheus staff  737808 Dec 20  2017 usr/local/bin/wget
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/bin/._dbclient
-rwxr-xr-x  0 morpheus staff  234688 Dec 20  2017 usr/local/bin/dbclient
-rw-r--r--  0 morpheus staff  166576 Apr 25 19:23 usr/local/bin/qilin.o
-rw-r--r--  0 morpheus staff    1060 Apr 25 19:23 usr/local/bin/shaihulud.c
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/bin/._filemon
-rwxr-xr-x  0 morpheus staff   52304 Dec 20  2017 usr/local/bin/filemon
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/bin/._dropbear
-rwxr-xr-x  0 morpheus staff  235696 Dec 20  2017 usr/local/bin/dropbear
-rwxr-xr-x  0 morpheus staff  194480 Apr 25 19:23 usr/local/bin/shaihulud
-rwxr-xr-x  0 morpheus staff  590944 Apr 25 17:48 usr/local/bin/procexp
-rwxr-xr-x  0 morpheus staff  552544 Apr 25 17:50 usr/local/bin/jtool
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/bin/._dropbearkey
-rwxr-xr-x  0 morpheus staff  169408 Dec 20  2017 usr/local/bin/dropbearkey
-rwxr-xr-x  0 morpheus staff   70592 Feb 28  2018 usr/local/bin/jlutil
-rwxr-xr-x  0 morpheus staff  504928 Apr 25 18:03 usr/local/bin/joker
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/bin/._dropbearconvert
-rwxr-xr-x  0 morpheus staff  170144 Dec 20  2017 usr/local/bin/dropbearconvert
-rwxr-xr-x  0 morpheus staff     178 Dec 20  2017 usr/local/bin/._dropbear.orig
-rwxr-xr-x  0 morpheus staff  252400 Dec 20  2017 usr/local/bin/dropbear.orig
-rw-r--r--  0 morpheus staff     910 Apr 25 17:48 usr/local/bin/procexp.ent
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 usr/sbin/._joreg
-rwxr-xr-x  0 morpheus staff   75296 Apr 25 17:45 usr/sbin/joreg
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 usr/sbin/._ioreg
-rwxr-xr-x  0 morpheus staff   75296 Apr 25 17:45 usr/sbin/ioreg
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 usr/sbin/._sysctl
-rwxr-xr-x  0 morpheus staff   53088 Apr 25 17:45 usr/sbin/sysctl
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 usr/sbin/._taskpolicy
-rwxr-xr-x  0 morpheus staff   51824 Apr 25 17:45 usr/sbin/taskpolicy
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 usr/sbin/._netstat
-rwxr-xr-x  0 morpheus staff  227472 Apr 25 17:45 usr/sbin/netstat
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 usr/sbin/._ltop
-rwxr-xr-x  0 morpheus staff   52384 Apr 25 17:45 usr/sbin/ltop
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:45 usr/sbin/._chown
-rwxr-xr-x  0 morpheus staff   52192 Apr 25 17:45 usr/sbin/chown
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:53 usr/sbin/._kextstat
-rwxr-xr-x  0 morpheus staff   77024 Apr 25 17:53 usr/sbin/kextstat
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._tee
-rwxr-xr-x  0 morpheus staff   51120 Apr 25 17:46 usr/bin/tee
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._split
-rwxr-xr-x  0 morpheus staff   68880 Apr 25 17:46 usr/bin/split
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._vim
-rwxr-xr-x  0 morpheus staff 2190272 Apr 25 17:46 usr/bin/vim
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._hexdump
-rwxr-xr-x  0 morpheus staff   71488 Apr 25 17:46 usr/bin/hexdump
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:52 usr/bin/._lsmp
-rwxr-xr-x  0 morpheus staff   71380 Apr 25 17:52 usr/bin/lsmp
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._vm_stat
-rwxr-xr-x  0 morpheus staff   52064 Apr 25 17:46 usr/bin/vm_stat
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._syslog
-rwxr-xr-x  0 morpheus staff  187472 Apr 25 17:46 usr/bin/syslog
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._du
-rwxr-xr-x  0 morpheus staff   53088 Apr 25 17:46 usr/bin/du
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._fs_usage
-rwxr-xr-x  0 morpheus staff  125344 Apr 25 17:46 usr/bin/fs_usage
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._renice
-rwxr-xr-x  0 morpheus staff   51008 Apr 25 17:46 usr/bin/renice
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._xxd
-rwxr-xr-x  0 morpheus staff   52016 Apr 25 17:46 usr/bin/xxd
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._sc_usage
-rwxr-xr-x  0 morpheus staff   73968 Apr 25 17:46 usr/bin/sc_usage
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._less
-rwxr-xr-x  0 morpheus staff  233968 Apr 25 17:46 usr/bin/less
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._sed
-rwxr-xr-x  0 morpheus staff   73184 Apr 25 17:46 usr/bin/sed
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._nano
-rwxr-xr-x  0 morpheus staff  262992 Apr 25 17:46 usr/bin/nano
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._tset
-rwxr-xr-x  0 morpheus staff   54400 Apr 25 17:46 usr/bin/tset
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._seq
-rwxr-xr-x  0 morpheus staff   51904 Apr 25 17:46 usr/bin/seq
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._uname
-rwxr-xr-x  0 morpheus staff   51104 Apr 25 17:46 usr/bin/uname
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._uicache
-rwxr-xr-x  0 morpheus staff   53520 Apr 25 17:46 usr/bin/uicache
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._reset
-rwxr-xr-x  0 morpheus staff   54400 Apr 25 17:46 usr/bin/reset
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._wc
-rwxr-xr-x  0 morpheus staff   51840 Apr 25 17:46 usr/bin/wc
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._gzip
-rwxr-xr-x  0 morpheus staff   90000 Apr 25 17:46 usr/bin/gzip
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._printf
-rwxr-xr-x  0 morpheus staff   51968 Apr 25 17:46 usr/bin/printf
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._tail
-rwxr-xr-x  0 morpheus staff   53872 Apr 25 17:46 usr/bin/tail
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._grep
-rwxr-xr-x  0 morpheus staff  190768 Apr 25 17:46 usr/bin/grep
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._script
-rwxr-xr-x  0 morpheus staff   53232 Apr 25 17:46 usr/bin/script
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._more
-rwxr-xr-x  0 morpheus staff  233968 Apr 25 17:46 usr/bin/more
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._time
-rwxr-xr-x  0 morpheus staff   51136 Apr 25 17:46 usr/bin/time
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._plconvert
-rwxr-xr-x  0 morpheus staff   52080 Apr 25 17:46 usr/bin/plconvert
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._head
-rwxr-xr-x  0 morpheus staff   51776 Apr 25 17:46 usr/bin/head
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._clear
-rwxr-xr-x  0 morpheus staff   50640 Apr 25 17:46 usr/bin/clear
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._killall
-rwxr-xr-x  0 morpheus staff   52496 Apr 25 17:46 usr/bin/killall
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._stat
-rwxr-xr-x  0 morpheus staff   52080 Apr 25 17:46 usr/bin/stat
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._sqlite3
-rwxr-xr-x  0 morpheus staff 1333456 Apr 25 17:46 usr/bin/sqlite3
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._screen
-rwxr-xr-x  0 morpheus staff  428416 Apr 25 17:46 usr/bin/screen
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._arch
-rwxr-xr-x  0 morpheus staff   54976 Apr 25 17:46 usr/bin/arch
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._cut
-rwxr-xr-x  0 morpheus staff   53040 Apr 25 17:46 usr/bin/cut
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._xargs
-rwxr-xr-x  0 morpheus staff   53568 Apr 25 17:46 usr/bin/xargs
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._what
-rwxr-xr-x  0 morpheus staff   50816 Apr 25 17:46 usr/bin/what
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._chflags
-rwxr-xr-x  0 morpheus staff   51296 Apr 25 17:46 usr/bin/chflags
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._id
-rwxr-xr-x  0 morpheus staff   51936 Apr 25 17:46 usr/bin/id
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._find
-rwxr-xr-x  0 morpheus staff   94368 Apr 25 17:46 usr/bin/find
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._scp
-rwxr-xr-x  0 morpheus staff   55552 Apr 25 17:46 usr/bin/scp
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._true
-rwxr-xr-x  0 morpheus staff   50416 Apr 25 17:46 usr/bin/true
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._hostinfo
-rwxr-xr-x  0 morpheus staff   51216 Apr 25 17:46 usr/bin/hostinfo
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._tar
-rwxr-xr-x  0 morpheus staff  459392 Apr 25 17:46 usr/bin/tar
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._false
-rwxr-xr-x  0 morpheus staff   50416 Apr 25 17:46 usr/bin/false
-rwxr-xr-x  0 morpheus staff   55648 Apr 25 17:46 usr/bin/login
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._which
-rwxr-xr-x  0 morpheus staff   51504 Apr 25 17:46 usr/bin/which
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._passwd
-rwxr-xr-x  0 morpheus staff   52832 Apr 25 17:46 usr/bin/passwd
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._nohup
-rwxr-xr-x  0 morpheus staff   51312 Apr 25 17:46 usr/bin/nohup
-rwxr-xr-x  0 morpheus staff   53184 Apr 25 17:46 usr/bin/w
-rwxr-xr-x  0 morpheus staff     178 Apr 25 17:46 usr/bin/._gunzip
-rwxr-xr-x  0 morpheus staff   90000 Apr 25 17:46 usr/bin/gunzip
Saigon:~ geosn0w$ 
```

### Remounting the File System

So, we exploited the kernel and got kernel memory R/W, we exploited a bug or we bestowed ourselves the kernel credentials so we also exited the SandBox, now we wanna drop our payload (which can contain Cydia, binaries, config files, dummy files for checking whether the jailbreak was installed, etc). To be able to do that, we need to have Write permissions over the file system. By default, the iOS ROOT FS is mounted as Read Only, so we will need to remount that, hence the name of the patch: Root FS Remount.

This is the component that was missing back in July 2018 when Electra for iOS 11.3.1 was in development, and most of the eta folks went haywire.

So, how do we do that?

On QiLin (and therefore on LiberiOS and Osiris Jailbreak), the remounting up to iOS 11.2.6 works this way:
As I said, by default the ROOT FS is mounted as read-only. Not only that, but the SandBox also has a hook that prevents you from remounting it as Read / Write. The hook is enforced through MACF calls in <code class="high">mount_begin_update()</code> and <code class="high">mount_common()</code>. All the hook does it to check for the presence of the <code class="high">MNT_ROOTFS</code> flag in the mount flags. If it exists, the operation fails. So what QiLin does? Simple. It turns off the <code class="high">MNT_ROOTFS</code> flag. 

The following listing is the <code class="high">remountRootFS</code> in the QiLin Toolkit and was made publicly available by Jonathan Levin on newosxbook.com and in the Volume III of *OS Internals.

```c
int remountRootFS (void)
{
   ...
   uint64_t rootVnodeAddr = findKernelSymbol("_rootvnode");
   uint64_t *actualVnodeAddr;
   struct vnode *rootvnode = 0;
   char *v_mount;
   status("Attempting to remount rootFS...\n");
   readKernelMemory(rootVnodeAddr, sizeof(void *), &actualVnodeAddr);
   readKernelMemory(*actualVnodeAddr, sizeof(struct vnode), &rootvnode);
   readKernelMemory(rootvnode->v_mount, 0x100, &v_mount);
   // Disable MNT_ROOTFS momentarily, remounts , and then flips the flag back
   uint32_t mountFlags = (*(uint32_t * )(v_mount + 0x70)) & ~(MNT_ROOTFS | MNT_RDONLY);
   writeKernelMemory(((char *)rootvnode->v_mount) + 0x70 ,sizeof(mountFlags), &mountFlags);
   char *opts = strdup("/dev/disk0s1s1");
   // Not enough to just change the MNT_RDONLY flag - we have to call
   // mount(2) again, to refresh the kernel code paths for mounting..
   int rc = mount("apfs", "/", MNT_UPDATE, (void *)&opts);
   printf("RC: %d (flags: 0x%x) %s \n", rc, mountFlags, strerror(errno));
   mountFlags |= MNT_ROOTFS;
   writeKernelMemory(((char *)rootvnode->v_mount) + 0x70 ,sizeof(mountFlags), &mountFlags);
   // Quick test:
   int fd = open ("/test.txt", O_TRUNC| O_CREAT);
   if (fd < 0) { error ("Failed to remount /"); }
   else {
     status("Mounted / as read write :-)\n");
     unlink("/test.txt"); // clean up
   }
 return 0;
```
Jonathan Levin's code is pretty straightforward. Flip the <code class="high">MNT_ROOTFS</code> flag, call <code class="high">mount(2)</code> to refresh the kernel code paths for mounting, restore the flag and test. Done. You're R/W. 

On older jailbreaks patches to <code class="high">LightweightVolumeManager::_mapForIO</code> were done. 

### Electra's remount

iOS 11.3 took it a step further by involving APFS Snapshots. APFS has been used for quite a long time in iOS at the moment when Apple started using the snapshots, but when they did it broke the tried and true remount we had for iOS 11.2.x and even older. To fix this, a new bug needed to be found. The problem is that iOS would revert to a snapshot which is mounted read-only, so everything we install in terms of tweaks, binaries, etc is gone every time we reboot.

At this point two things can be done: Change the whole jailbreaking and go "ROOTless", or find a way around the snapshots.
It is thanks to @pwn20wnd and @umanghere that a proper remount has been created. Umang has found a "bug" that pwn20wnd has exploited in Electra.

Well, to say that it was a bug it's a bit of a stretch. It isn't a bug but rather a feature of <code class = "high">fs_snapshot syscall</code>. Anyways, it works.

Pwn20wnd's bypass for this snapshot problem is also a very straightforward one.
Here is the function from the source code of Electra for iOS 11.3.1:

```c
int remountRootAsRW(uint64_t slide, uint64_t kern_proc, uint64_t our_proc, int snapshot_success){
    if (/* iOS 11.2.6 or lower don't need snapshot */ kCFCoreFoundationVersionNumber <= 1451.51 || /* we're already remounted properly */ snapshot_success == 0){
        return remountRootAsRW_old(slide, kern_proc, our_proc);
    }
    
    if (!getOffsets(slide)){
        return -1;
    }
    
    uint64_t kernucred = rk64(kern_proc+offsetof_p_ucred);
    uint64_t ourucred = rk64(our_proc+offsetof_p_ucred);
     
    uint64_t vfs_context = get_vfs_context();
    
    char *dev_path = "/dev/disk0s1s1";
    uint64_t devVnode = getVnodeAtPath(vfs_context, dev_path);
    uint64_t specInfo = rk64(devVnode + offsetof_v_specinfo);
    
    wk32(specInfo + offsetof_si_flags, 0); //clear dev vnode's v_specflags
    
    if (file_exists(ROOTFSMNT))
        rmdir(ROOTFSMNT);
    
    mkdir(ROOTFSMNT, 0755);
    chown(ROOTFSMNT, 0, 0);
    
    printf("Temporarily setting kern ucred\n");
    
    wk64(our_proc+offsetof_p_ucred, kernucred);
    
    int rv = -1;
    
    if (mountDevAsRWAtPath(dev_path, ROOTFSMNT) != ERR_SUCCESS) {
        printf("Error mounting root at %s\n", ROOTFSMNT);
        
        goto out;
    }
    
    /* APFS snapshot mitigation bypass bug by CoolStar, exploitation by Pwn20wnd */
    /* Disables the new APFS snapshot mitigations introduced in iOS 11.3 */
    
    printf("Disabling the APFS snapshot mitigations\n");
    
    const char *systemSnapshot = find_system_snapshot(ROOTFSMNT);
    const char *newSystemSnapshot = "orig-fs";
    
    if (!systemSnapshot) {
        goto out;
    }
    
    int rvrename = do_rename(ROOTFSMNT, systemSnapshot, newSystemSnapshot);
    
    if (rvrename) {
        goto out;
    }
    
    rv = 0;

    unmount(ROOTFSMNT, 0);
    rmdir(ROOTFSMNT);
    
out:
    printf("Restoring our ucred\n");
    
    wk64(our_proc+offsetof_p_ucred, ourucred);
    
    //cleanup
    vnode_put(devVnode);
    
    if (!rv) {
        printf("Disabled the APFS snapshot mitigations\n");
        
        printf("Restarting\n");
        restarting();
        sleep(2);
        do_restart();
    } else {
        printf("Failed to disable the APFS snapshot mitigations\n");
    }
    
    return -1;
}
```

It may look complicated. That's because it is. It took Pwn20wnd a lot of work to achieve this bypass, but once the bug was known, the problem started to fall apart. See, the bug is very simple: iOS will revert to an APFS System snapshot after every reboot if there is one. Here's the catch - if there is one. If there isn't, instead of boot looping or erroring out in a destructive way, iOS casually continues booting just like it did on iOS 11.2.6 where there was no snapshot. 

So the patch? Find and rename the snapshot to something else.

The implementation? A bit more complicated.
If you analyze the code you can see that the name of the said snapshot is dynamic (or at least contains a dynamic part) so it cannot be hardcoded. The dynamic part happens to be the <code class="high">boot-manifest-hash</code>. Before doing anything, Pwn20wnd seems to be bestowing himself the kernel credentials.

You can find it yourself by running:

```bash
ioreg -p IODeviceTree -l | grep boot-manifest-hash
```
In the Electra, all the logic for finding the boot-manifest-hash is located in <code class="high">apfs_util.c</code> as you can see here:

```c
char *copyBootHash(void) {
    unsigned char buf[1024];
    uint32_t length = 1024;
    io_registry_entry_t chosen = IORegistryEntryFromPath(kIOMasterPortDefault, "IODeviceTree:/chosen");
    
    if (!MACH_PORT_VALID(chosen)) {
        printf("Unable to get IODeviceTree:/chosen port\n");
        return NULL;
    }
    
    kern_return_t ret = IORegistryEntryGetProperty(chosen, "boot-manifest-hash", (void*)buf, &length);
    
    IOObjectRelease(chosen);
    
    if (ret != ERR_SUCCESS) {
        printf("Unable to read boot-manifest-hash\n");
        return NULL;
    }
    
    // Make a hex string out of the hash
    char manifestHash[length*2+1];
    bzero(manifestHash, sizeof(manifestHash));
    
    int i;
    for (i=0; i<length; i++) {
        sprintf(manifestHash+i*2, "%02X", buf[i]);
    }
    
    printf("Hash: %s\n", manifestHash);
    return strdup(manifestHash);
}
```

This function is called from inside another function called <code class="high">find_system_snapshot</code> which handles the logic for finding the snapshot itself. The function appends the retrieved manifestHash to the hard-coded part which is <code class="high">com.apple.os.update-</code> resulting in the real name of the current snapshot. It then returns the snapshot name to the caller, but not before printing it out loud :P

```c
const char *find_system_snapshot(const char *rootfsmnt) {
    char *bootHash = copyBootHash();
    char *system_snapshot = malloc(sizeof(char *) + (21 + strlen(bootHash)));
    bzero(system_snapshot, sizeof(char *) + (21 + strlen(bootHash)));
    
    if (!bootHash) {
        return NULL;
    }
    sprintf(system_snapshot, "com.apple.os.update-%s", bootHash);
    printf("System snapshot: %s\n", system_snapshot);
    return system_snapshot;
}
```
With kernel's credentials in place, and with the proper name of the snapshot, Pwn20wnd returns back into rootfs_remount.c for the last part of this magnificent exploit - renaming the Snapshot. He renames it to "orig-fs", then he checks if the renaming succeeded. Then he restores his own credentials and drops kernel's. Finally, he reboots the device. That's why the first time you use Electra for iOS 11.3-11.3.1 your device will have a mandatory reboot no matter which exploit you use. 

Now that the snapshot has been renamed, iOS has no snapshot to mount so it simply doesn't. Problem solved. 10/10 - IGN.

### A note on the VFS exploit released by Ian Beer of Google Project Zero
The issue with the VFS exploit called "empty_list" is that, due to the nature of the exploit it is usually pretty hard to get it to work reliably. It has been used, however, in both Electra and Unc0ver Jailbreaks because it doesn't require a paid Apple Developer Account compared to the other exploit released by Ian Beer called MPTCP which is almost bulletproof but requires the Multi-Path entitlement which is not available without a Paid developer account.

Of course, not requiring a paid developer account, even though getting it to work is an exercise in futility sometimes, this seems to be prefered by the general public - that is until they learn about Ignition and other signing services who sign for free the MPTCP version.

### Stars
Star 1: Not a real spyware, just a nice name because WebKitness.

### Special thanks
<ul>
<li>Jonathan Levin for his <a href="http://newosxbook.com/index.php">books</a>, tools and impressive patience with me and my odd questions - YOU ROCK!</li>
<li>@pwn20wnd for pushing me to learn more (and more) being supportive, and findinding errors in the write-up :) </li>
<li>ETA Folks / reditters / naggers for making me laugh from time to time </li>
<li>IBSparkes for answering many of my questions during all these months</li>
<li>stek29 for answering my weird memory related questions</li>
</ul>

### License for the diagrams
The diagrams are all built by myself in a tedious process, however, I license them as MIT. Use them as you please as long as you credit me.

### Errare humanum est!
If you find anything wrong in the article feel free to trash-talk me on reddit or better yet, to tell me on Twitter :P

---
title: Debugging macOS Kernel For Fun
layout: post
---
Hi there! It's GeoSn0w. Debugging the damn kernel is a very entertaining thing to do (until you provoke a serious exception, that is, and the kernel crawls into a corner from which it refuses to get out). Unfortunately, it's not an easy task nowadays and Apple seems to want to make it harder and harder. At first, by hiding under lock and key the documentation about the <code class="high">debug</code> boot arguments, and then by moving the Kernel Debug Kit under the Developer Account-only Downloads section. There are many write-ups on the internet about debugging the kernel on macOS but many of them are outdated as hell and the NVRAM boot arguments they tell you to set are no longer working. Some of them stop at just the "now you should have a working debug session" - so what? what do I do next? I wanna have fun Goddammit! In this write-up I am doing my best to provide the most accurate information for 2019, the right commands, the right <code class="high">boot-args</code> and of course, practical examples you can begin with.

### A note for the l33t h4xxors
If you are going to say "well if people don't know what to do with a kernel debugger they shouldn't use one", please segfault. You've been a beginner once and wanted to have fun and learn so shut up.

### Getting started with Kernel debugging on macOS
Okay, so the first things we need to sort out is the lab. You need to have a device of which kernel you want to debug (in my case I am using my iMac 2011 as a debuggee) and a device from where you do the debugging (I am using my MacBook Pro 2009 for this). You can connect the two in various ways I will discuss in this write-up, but in my case, the best method (and the most reliable) seems to be via a Firewire cable between the two (that is because both my machines have actual firewire ports, not USB-C bullshit).

With the hardware part set up, we need some software. You CAN theoretically debug the <code class="high">RELEASE</code> kernel, but when you're a beginner the <code class="high">Development</code> one is much better. By default, macOS comes with a <code class="high">RELEASE</code> fused kernel located in <code class="high">/System/Library/Kernels/kernel</code> where <code class="high">kernel</code> is a <code class="high">Mach-O 64-bit executable x86_64</code>. We can get ourselves the <code class="high">Development</code> kernel for our macOS version by navigating to Apple Developer portal and downloading the Kernel Debug Kit. It's surprising that Apple only put the kit under a normal, free Apple Developer Account lock; I would have expected them to put it under the paid Apple Developer Account downloads by now.

Anyways, once you navigate to this <a href="https://developer.apple.com/downloads/index.action?q=Kernel%20Debug%20Kit">Apple Developer Portal Downloads</a> section, you will see something like this:

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/49338190-7ba07380-f5ec-11e8-84bf-69e26c5715bf.png"/>
</p>

<b>VERY IMPORTANT!</b> You should get the appropriate kernel debug kit for your specific macOS version! You will boot the downloaded kernel later and if it doesn't match your macOS version, it will NOT boot! I am not responsible for any damages to your files, computer, life, cat, whatever. Proceed at your own risk.

### Finding the proper Kernel Debug Kit for your macOS version [!]
In order to locate the proper Kernel Debug Kit, you must know your macOS version and the actual build number. You can easily see what macOS version you are running by going to the Apple logo, pressing "About This Mac", and reading the version in the window that appears, for example, "Version 10.13.6". 

For the actual build number, you can either click once on the "Version" label in that "About This Mac" window, or you can run the terminal command <code class="high">sw_vers | grep BuildVersion</code>. In my case running the command outputs "BuildVersion:    17G65".

```bash
Last login: Sun Dec  2 03:58:16 on ttys000
Isabella:~ geosn0w$ sw_vers | grep BuildVersion
BuildVersion:    17G65
Isabella:~ geosn0w$ 
```
So, in my case, I am running macOS High Sierra (10.13.6) build number 17G65. Looking in the Downloads section I could immediately find my version listed so I can download the .DMG file containing the installation files. The download is pretty small.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/49338318-93c4c280-f5ed-11e8-84ef-5313af537f9a.png"/>
</p>

### Preparing the debuggee for being debugged by the debugger ;)
With the Debug Kit downloaded on the debuggee (that is the machine whose kernel you wanna debug), mount the DMG file by double-clicking on it. Inside the DMG you will find a file called <code class="high">KernelDebugKit.pkg</code>. Double-click that and follow the installation wizard. It will ask you for your macOS login password. If asked, do not move the installer to trash. You will need it later.

When the installation is complete it will look something like this.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/49338411-c02d0e80-f5ee-11e8-863d-2c7cda6acf93.png"/>
</p>

After the installation completes, navigate to <code class="high">/Library/Developer/KDKs</code>. There you will have a folder named <code class="high">KDK_YOUR_VERSION_BUILDNUMBER.kdk</code>. In my case the folder is called <code class="high">KDK_10.13.6_17G65.kdk</code>. Open the folder and inside it you will find another folder called "System". Navigate into the folder, then into "Library" and then into "Kernels". In that folder you will find a few kernel binaries, some Xcode Debug Symbol files (.dSYM), etc. You are interested in the file called <code class="high">kernel.development</code>.
  
Copy the <code class="high">kernel.development</code> and paste into <code class="high">/System/Library/Kernels/</code> alongside your release kernel binary. When you are done, you should have two kernels on your macOS installation, a <code class="high">RELEASE</code> one and a <code class="high">DEVELOPMENT</code> one.

### Disabling SIP on the debuggee
For proper debugging, you may need to disable <code class="high">SIP (System Integrity Protection)</code> on the machine whose kernel you wanna debug. To do that, reboot the machine in <code class="high">Recovery Mode</code>. To do that, reboot the machine and when you hear the "BOONG!", or when the screen turns on, press <code class="high">CMD + R</code>. Wait a few seconds for it to boot into Recovery Mode user interface, and open "Terminal" from the top bar.

In the Recovery Terminal, write <code class="high">csrutil disable</code>. Then reboot the machine and boot it normally to macOS.

### Setting the correct NVRAM boot-args as of 2018/2019
The <code class="high">boot-args</code> have been changed during the years by Apple so what you find on the internet may or may not work depending on how old the write-up is. The following <code class="high">boot-args</code> have been tested and are working with macOS High Sierra as of 2018.

<B>NOTE!</B> The following <code class="high">boot-args</code> assume you are doing this over Firewire or via Firewire through Thunderbolt adpter.

<b>If you are using a FireWire cable through a real FireWire port (older Macs):</b>

In the Terminal run the following command:

```bash
sudo nvram boot-args="debug=0x8146 kdp_match_name=firewire fwdebug=0x40 pmuflags=1 -v"
```
<b>If you are using a FireWire through ThunderBolt adapter:</b>

In the Terminal run the following command:

```bash
sudo nvram boot-args="debug=0x8146 kdp_match_name=firewire fwkdp=0x8000 fwdebug=0x40 pmuflags=1 -v"
```

The difference is that <code class="high">fwkdp=0x8000</code> tells <code class="high">IOFireWireFamily.kext::AppleFWOHCI_KDP</code> to use the non-built-in firewire <-> thunderbolt adapter for the debugging session.

This is pretty much it, the debuggee is ready to be debugged after a reboot, but let me explain you a bit what the boot arguments do.
<ul>
  <li><code class="high">debug=0x8146</code> -> This enables the debugging and allows us to press the Power button to trigger a <code class="high">NMI</code> This stands for <code class="high">Non-Maskable Interrupt</code> and it is used to allow the debugger to connect.</li>
  <li><code class="high">kdp_match_name=firewire</code> -> This allows us to debug via <code class="high">FireWireKDP</code>.</li>
  <li><code class="high">fwkdp=0x8000</code> -> As I explained earlier, this tells the kext to use the thunderbolt to firewire adapter. Don't set it if you use normal Firewire ports.</li>
  <li><code class="high">fwdebug=0x40</code> -> Enables more verbose output from the <code class="high">AppleFWOHCI_KDP</code> driver, it is useful for troubleshooting.</li>
  <li><code class="high">pmuflags=1</code> -> This one disables the <code class="high">Watchdog timer</code>.</li>
  <li><code class="high">-v</code> -> The simplest of birds. This one tells the computer to boot verbose instead of the normal Apple logo and progress bar. This is extremely useful for troubleshooting, not only when you debug but also when you have boot loops.</li>
</ul>

Aside from these boot arguments that we set, macOS supports more args that are defined in <a href="http://newosxbook.com/src.jl?tree=xnu&file=/osfmk/kern/debug.h"><code class="high">/osfmk/kern/debug.h</code></a> which I am going to list below. These were taken from <code class="high">xnu-4570.41.2</code>.

```c
...
/* Debug boot-args */
#define DB_HALT        0x1
//#define DB_PRT          0x2 -- obsolete
#define DB_NMI        0x4
#define DB_KPRT        0x8
#define DB_KDB        0x10
#define DB_ARP          0x40
#define DB_KDP_BP_DIS   0x80
//#define DB_LOG_PI_SCRN  0x100 -- obsolete
#define DB_KDP_GETC_ENA 0x200

#define DB_KERN_DUMP_ON_PANIC        0x400 /* Trigger core dump on panic*/
#define DB_KERN_DUMP_ON_NMI        0x800 /* Trigger core dump on NMI */
#define DB_DBG_POST_CORE        0x1000 /*Wait in debugger after NMI core */
#define DB_PANICLOG_DUMP        0x2000 /* Send paniclog on panic,not core*/
#define DB_REBOOT_POST_CORE        0x4000 /* Attempt to reboot after
                        * post-panic crashdump/paniclog
                        * dump.
                        */
#define DB_NMI_BTN_ENA      0x8000  /* Enable button to directly trigger NMI */
#define DB_PRT_KDEBUG       0x10000 /* kprintf KDEBUG traces */
#define DB_DISABLE_LOCAL_CORE   0x20000 /* ignore local kernel core dump support */
#define DB_DISABLE_GZIP_CORE    0x40000 /* don't gzip kernel core dumps */
#define DB_DISABLE_CROSS_PANIC  0x80000 /* x86 only - don't trigger cross panics. Only
                                         * necessary to enable x86 kernel debugging on
                                         * configs with a dev-fused co-processor running
                                         * release bridgeOS.
                                         */
#define DB_REBOOT_ALWAYS        0x100000 /* Don't wait for debugger connection */
...
```

### Preparing the debugger machine
Okay, now that the debuggee is ready, we need to configure the machine where the debugger will run. For that, I am using another macOS machine running El Capitan, but that matters less. Remember that Kernel Debug Kit we installed on the debuggee? We need to install it on the debugger machine too. The difference is that we will NOT move the kernels and we will not set any boot arguments on the debugger. We need the kernel because we are going to use <code class="high">lldb</code> to perform the debugging. If you're familiar with GDB instead, don't worry. There is a <a href ="https://lldb.llvm.org/lldb-gdb.html"> GDB -> LLDB command sheet available right here</a>.

Note: You should install the same macOS Kernel Debug toolkit on the debugger even if it doesn't run the same macOS version as the debuggee because we will not boot any kernel on the debugger.

After you installed the toolkit, it's time to connect.

### Debugging the kernel
To begin, reboot the debuggee. You will see that it boots into a text-mode console which spits out verbose boot information. Wait until you see "DSMOS has arrived!" on the screen and press the Power button once. Don't hold it pressed. On the debuggee, you will see that it is waiting for a debugger to be connected.

<B>On the debugger machine:</B>

Open a Terminal window and start <code class="high">fwkdp -v</code>, this is the <code class="high">FireWire KDP Tool</code> and will listen to the FireWire interface and redirect the data to the <code class="high">localhost</code> so that you can set the KDP target as <code class="high">localhost</code> or <code class="high">127.0.0.1</code>. You should get an output similar to this:

```bash
MacBook-Pro-van-Mac:~ mac$ fwkdp -v
FireWire KDP Tool (v1.6)
Matched on device 0x00002403
Created plugin interface 0x7f9e50c03548 with result 0x00000000
Created device interface 0x7f9e50c0d508 with result 0x00000000
Opened device interface 0x7f9e50c0d508 with result 0x00000000
Added callback dispatcher with result 0x00000000
Created pseudo address space 0x7f9e50c0d778 at 0xf0430000
Address space enabled.
2018-12-02 05:51:05.453 fwkdp[5663:60796] CFSocketSetAddress listen failure: 102
Created KDP socket listener 0x7f9e50c0d940 with result 0
KDP Proxy and CoreDump-Receive dual mode active.
Use 'localhost' as the KDP target in gdb.
Ready.
```
Now, WITHOUT closing this window open another Terminal window and start <code class="high">lldb debugger</code> by passing it the kernel.development file you installed on the debugger machine as part of the Kernel Debug Kit. Remember, the kernel can be found at <code class="high">/Library/Developer/KDKs/</code>. There you will have a folder named <code class="high">KDK_YOUR_VERSION_BUILDNUMBER.kdk</code>. In my case the folder is called <code class="high">KDK_10.13.6_17G65.kdk</code>. and my full kernel path that I need is <code class="high">/Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development</code>.

The command in the new terminal window in MY case will be <code class="high">xcrun lldb /Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development</code>

```bash
Last login: Sun Dec  2 10:37:51 on ttys000
MacBook-Pro-van-Mac:~ mac$ xcrun lldb /Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development
(lldb) target create "/Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development"
warning: 'kernel' contains a debug script. To run this script in this debug session:
command script import "/Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development.dSYM/Contents/Resources/DWARF/../Python/kernel.py"

To run all discovered debug scripts in this session:

    settings set target.load-script-from-symbol-file true

Current executable set to '/Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development' (x86_64).
```

As you can see, <code class="high">lldb</code> says that the "kernel" contains a debug script. In the lldb window that is now open, run <code class="high">settings set target.load-script-from-symbol-file true</code> to run the script.

```bash
Last login: Sun Dec  2 10:37:51 on ttys000
MacBook-Pro-van-Mac:~ mac$ xcrun lldb /Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development
(lldb) target create "/Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development"
warning: 'kernel' contains a debug script. To run this script in this debug session:
command script import "/Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development.dSYM/Contents/Resources/DWARF/../Python/kernel.py"

To run all discovered debug scripts in this session:

    settings set target.load-script-from-symbol-file true

Current executable set to '/Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development' (x86_64).
(lldb) settings set target.load-script-from-symbol-file true

Loading kernel debugging from /Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development.dSYM/Contents/Resources/DWARF/../Python/kernel.py
LLDB version lldb-360.1.70
settings set target.process.python-os-plugin-path "/Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development.dSYM/Contents/Resources/DWARF/../Python/lldbmacros/core/operating_system.py"
settings set target.trap-handler-names hndl_allintrs hndl_alltraps trap_from_kernel hndl_double_fault hndl_machine_check _fleh_prefabt _ExceptionVectorsBase _ExceptionVectorsTable _fleh_undef _fleh_dataabt _fleh_irq _fleh_decirq _fleh_fiq_generic _fleh_dec
command script import "/Library/Developer/KDKs/KDK_10.13.6_17G65.kdk/System/Library/Kernels/kernel.development.dSYM/Contents/Resources/DWARF/../Python/lldbmacros/xnu.py"
xnu debug macros loaded successfully. Run showlldbtypesummaries to enable type summaries.

settings set target.process.optimization-warnings false
(lldb)
```
Now we can finally connect <code class="high">lldb</code> to the live kernel by writing <code class="high">kdp-remote localhost</code>. If you did everything right, the kernel should connect and you should have an output like this. A LOT of text will start to pour into your lldb window initially, then it should come to a rest state.

```bash
(lldb) kdp-remote localhost
Version: Darwin Kernel Version 17.7.0: Wed Oct 10 23:06:14 PDT 2018; root:xnu-4570.71.13~1/DEVELOPMENT_X86_64; UUID=1718D865-98B4-3F6E-97CF-42BF0D02ADD7; stext=0xffffff802e800000
Kernel UUID: 1718D865-98B4-3F6E-97CF-42BF0D02ADD7
Load Address: 0xffffff802e800000
Kernel slid 0x2e600000 in memory.
Loaded kernel file /Library/Developer/KDKs/KDK_10.13.6_17G3025.kdk/System/Library/Kernels/kernel.development
Loading 152 kext modules warning: Can't find binary/dSYM for com.apple.kec.Libm (BC3F7DA4-03EA-30F7-B44A-62C249D51C10)
.warning: Can't find binary/dSYM for com.apple.kec.corecrypto (B081B8C1-1DFF-342F-8DF2-C3AA925ECA3A)
.warning: Can't find binary/dSYM for com.apple.kec.pthread (E64F7A49-CBF0-3251-9F02-3655E3B3DD31)
.warning: Can't find binary/dSYM for com.apple.iokit.IOACPIFamily (95DA39BB-7C39-3742-A2E5-86C555E21D67)
[...]
.Target arch: x86_64
.. done.
Target arch: x86_64
Instantiating threads completely from saved state in memory.
Process 1 stopped
* thread #2: tid = 0x0066, 0xffffff802e97a8d3 kernel.development`DebuggerWithContext [inlined] current_cpu_datap at cpu_data.h:401, name = '0xffffff80486a2338', queue = '0x0', stop reason = signal SIGSTOP
    frame #0: 0xffffff802e97a8d3 kernel.development`DebuggerWithContext [inlined] current_cpu_datap at cpu_data.h:401 [opt]
```

Now we are connected to the live kernel. You can see that the process is stopped, this means that the kernel is frozen, this is why the boot stopped right where you left it, but now that the debugger has been attached, we can safely continue the boot process into the normal macOS desktop. To do that we just have to unfreeze (continue) the process. To do that, type "c" for continue and press enter until the boot continues (more text is poured on the debuggee screen)

```bash
(lldb) c
Process 1 resuming
Process 1 stopped
* thread #2: tid = 0x0066, 0xffffff802e97a8d3 kernel.development`DebuggerWithContext [inlined] current_cpu_datap at cpu_data.h:401, name = '0xffffff80486a2338', queue = '0x0', stop reason = EXC_BREAKPOINT (code=3, subcode=0x0)
    frame #0: 0xffffff802e97a8d3 kernel.development`DebuggerWithContext [inlined] current_cpu_datap at cpu_data.h:401 [opt]
(lldb) c
```
Once the debuggee has fully booted into the macOS and you are on your desktop, you can pretty much do whatever debugging you want. To run a debugger command you will have to trigger again a <code class="high">NMI</code>, to do that you press the Power button once. The debuggee screen will freeze but your debugger's lldb screen will be active and you can read/write registers, read/write memory, disassemble at address, disassemble functions, etc. on the live kernel. To unfreeze it back you type again "c" and press enter on the lldb screen.

### Practical examples of Kernel debugging

<B>Example 1: Reading all the registers with lldb and writing "AAAAAAAA" to one of them</B>
  
Okay, to read all the registers, trigger a <code class="high">NMI</code> by pressing the Power button and in the open lldb window type register <code class="high">read --all</code>

```bash
(lldb) register read --all
General Purpose Registers:
      rax = 0xffffff802f40ba40  kernel.development`processor_master
      rbx = 0x0000000000000000
      rcx = 0xffffff802f40ba40  kernel.development`processor_master
      rdx = 0x0000000000000000
      rdi = 0x0000000000000004
      rsi = 0xffffff7fb1483ff4
      rbp = 0xffffff817e8ccd50
      rsp = 0xffffff817e8ccd10
       r8 = 0x0000000000000000
       r9 = 0x0000000000000001
      r10 = 0x00000000000004d1
      r11 = 0x00000000000004d0
      r12 = 0x0000000000000000
      r13 = 0x0000000000000000
      r14 = 0x0000000000000000
      r15 = 0xffffff7fb1483ff4
      rip = 0xffffff802e97a8d3  kernel.development`DebuggerWithContext + 403 [inlined] current_cpu_datap at cpu.c:220
 kernel.development`DebuggerWithContext + 403 [inlined] current_processor at debug.c:463
 kernel.development`DebuggerWithContext + 403 [inlined] DebuggerTrapWithState + 46 at debug.c:537
 kernel.development`DebuggerWithContext + 357 at debug.c:537
   rflags = 0x0000000000000046
       cs = 0x0000000000000008
       fs = 0x0000000000000000
       gs = 0x0000000000000000
 
Floating Point Registers:
      fcw = 0x0000
      fsw = 0x0000
      ftw = 0x00
      fop = 0x0000
       ip = 0x00000000
       cs = 0x0000
       dp = 0x00000000
       ds = 0x0000
    mxcsr = 0x00000000
 mxcsrmask = 0x00000000
    stmm0 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm1 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm2 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm3 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm4 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm5 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm6 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm7 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm0 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm1 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm2 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm3 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm4 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm5 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm6 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm7 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm8 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm9 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    xmm10 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    xmm11 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    xmm12 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    xmm13 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    xmm14 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    xmm15 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
 
Exception State Registers:
3 registers were unavailable.
(lldb)
```
Now let's write to one of the registers. DO NOT write to a register that is not set to <code class="high">0x0000000000000000</code> because you will overwrite something. Find one that is empty. In my case, <code class="high">R13</code> is empty (<code class="high">r13 = 0x0000000000000000</code>) so I can write garbage to it to prove my point. To write a string of AAAs to the register I can replace it's value to <code class="high">0x4141414141414141</code> where <code class="high">0x41</code> is the hex representation for ASCII character "A". To overwrite the register I can use the command <code class="high">register write r13 0x4141414141414141</code>. Sure enough, if we read the registers again the change is in place:

```bash
(lldb) register write R13 0x4141414141414141
(lldb) register read --all
General Purpose Registers:
      rax = 0xffffff802f40ba40  kernel.development`processor_master
      rbx = 0x0000000000000000
      rcx = 0xffffff802f40ba40  kernel.development`processor_master
      rdx = 0x0000000000000000
      rdi = 0x0000000000000004
      rsi = 0xffffff7fb1483ff4
      rbp = 0xffffff817e8ccd50
      rsp = 0xffffff817e8ccd10
       r8 = 0x0000000000000000
       r9 = 0x0000000000000001
      r10 = 0x00000000000004d1
      r11 = 0x00000000000004d0
      r12 = 0x0000000000000000
      r13 = 0x4141414141414141 <-- Yee overwritten this.
      r14 = 0x0000000000000000
      r15 = 0xffffff7fb1483ff4
      rip = 0xffffff802e97a8d3  kernel.development`DebuggerWithContext + 403 [inlined] current_cpu_datap at cpu.c:220
 kernel.development`DebuggerWithContext + 403 [inlined] current_processor at debug.c:463
 kernel.development`DebuggerWithContext + 403 [inlined] DebuggerTrapWithState + 46 at debug.c:537
 kernel.development`DebuggerWithContext + 357 at debug.c:537
   rflags = 0x0000000000000046
       cs = 0x0000000000000008
       fs = 0x0000000000000000
       gs = 0x0000000000000000
 
Floating Point Registers:
      fcw = 0x0000
      fsw = 0x0000
      ftw = 0x00
      fop = 0x0000
       ip = 0x00000000
       cs = 0x0000
       dp = 0x00000000
       ds = 0x0000
    mxcsr = 0x00000000
 mxcsrmask = 0x00000000
    stmm0 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm1 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm2 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm3 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm4 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm5 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm6 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    stmm7 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm0 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm1 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm2 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm3 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm4 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm5 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm6 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm7 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm8 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
     xmm9 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    xmm10 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    xmm11 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    xmm12 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    xmm13 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    xmm14 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
    xmm15 = {0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00}
 
Exception State Registers:
3 registers were unavailable.
 
(lldb)
```

<b>NOTE:</b> Of course, when you wanna read a single register you don't have to run <code class="high">register read --all</code>, you can simply specify the register with <code class="high">register read [register]</code> for example <code class="high">register read r13</code>.
    
<B>Example 2: Changing the Kernel version and name when running <code class="high">uname -a</code></b>

Time to do some real memory R/W to the kernel because we can. As you probably know, the command <code class="high">uname -a</code> in the Terminal lists the name of the kernel, the version, the, and the build date. What if we change that to whatever we want?

At first, we have no idea where the kernel stores that information so we need to find that. To do that we can use any Disassembler like IDA Pro, Hopper Disassembler, Jtool, Binary Ninja, etc. 

I will use IDA Pro for this task. What we're going to do is to load the kernel. development file into IDA Pro and let IDA analyze it. The analysis may take a while so please be patient. The Kernel ain't small. When IDA finishes, the output should look like this, more or less. You will know when IDA finished because it will say "AU: idle" in the left bottom corner.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/49339255-3afd2600-f5fd-11e8-9104-231c46548fa3.png"/>
</p>

Now, we have to find that string. We know that the kernel name is <code class="high">Darwin</code> when the uname -a command is executed in Terminal so in order to look for it in IDA, we go to the top bar -> View -> Open subviews -> Strings.
A new Strings window will appear and if you press <code class="high">CTRL + F</code> inside it a search box will appear at the bottom where we can search for Darwin. And what do you know? The whole string is there.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/49339322-e312ef00-f5fd-11e8-957a-46965a3e288a.png"/>
</p>

Double-click that and you will be redirected to a constant called <code class="high">_version</code>. So now we know. The constant is called "version" and that is what we have to look for. You may be inclined to copy the address of the constant from the IDA disassembly but WRONG! The Kernel uses <code class="high">KASLR</code> or <code class="high">Kernel Address Space Layout Randomization</code> so the address will not be the same, it will be slid. But you don't need to know the address anyways, you can get it easily with lldb on the debugger machine. 

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/49339365-8e23a880-f5fe-11e8-9633-b35da9c79498.png"/>
</p>

<B>Let's get the address of the "version" constant.</B>

It's actually very simple. Trigger a <code class="high">NMI</code> by pressing the Power Button (if you continued the process) and write <code class="high">print &(version)</code>.

```bash
(lldb) print &(version)
(const char (*)[101]) $8 = 0xffffff802f0f68f0
(lldb)
```
AHAM! So in my case the <code class="high">const char version</code> is at address <code class="high">0xffffff802f0f68f0</code>. Sure enough, if we list the character array it shows like this: 

```bash
(lldb) print version
(const char [101]) $9 = {
  [0] = 'D'
  [1] = 'a'
  [2] = 'r'
  [3] = 'w'
  [4] = 'i'
  [5] = 'n'
  [6] = ' '
  [7] = 'K'
  [8] = 'e'
  [9] = 'r'
  [10] = 'n'
  [11] = 'e'
  [12] = 'l'
  [13] = ' '
  [14] = 'V'
  [15] = 'e'
  [16] = 'r'
  [17] = 's'
  [18] = 'i'
  [19] = 'o'
  [20] = 'n'
  [21] = ' '
  [22] = '1'
  [23] = '7'
  [24] = '.'
  [25] = '7'
  [26] = '.'
  [27] = '0'
  [28] = ':'
  [29] = ' '
  [30] = 'W'
  [31] = 'e'
  [32] = 'd'
  [33] = ' '
  [34] = 'O'
  [35] = 'c'
  [36] = 't'
  [37] = ' '
  [38] = '1'
  [39] = '0'
  [40] = ' '
  [41] = '2'
  [42] = '3'
  [43] = ':'
  [44] = '0'
  [45] = '6'
  [46] = ':'
  [47] = '1'
  [48] = '4'
  [49] = ' '
  [50] = 'P'
  [51] = 'D'
  [52] = 'T'
  [53] = ' '
  [54] = '2'
  [55] = '0'
  [56] = '1'
  [57] = '8'
  [58] = ';'
  [59] = ' '
  [60] = 'r'
  [61] = 'o'
  [62] = 'o'
  [63] = 't'
  [64] = ':'
  [65] = 'x'
  [66] = 'n'
  [67] = 'u'
  [68] = '-'
  [69] = '4'
  [70] = '5'
  [71] = '7'
  [72] = '0'
  [73] = '.'
  [74] = '7'
  [75] = '1'
  [76] = '.'
  [77] = '1'
  [78] = '3'
  [79] = '~'
  [80] = '1'
  [81] = '/'
  [82] = 'D'
  [83] = 'E'
  [84] = 'V'
  [85] = 'E'
  [86] = 'L'
  [87] = 'O'
  [88] = 'P'
  [89] = 'M'
  [90] = 'E'
  [91] = 'N'
  [92] = 'T'
  [93] = '_'
  [94] = 'X'
  [95] = '8'
  [96] = '6'
  [97] = '_'
  [98] = '6'
  [99] = '4'
  [100] = '\0'
}
(lldb)
```

Actually, using the <code class="high">x <address></code> command we can dumpt the memory contents at that address. Let's do it.

```bash
(lldb) x 0xffffff802f0f68f0
0xffffff802f0f68f0: 44 61 72 77 69 6e 20 4b 65 72 6e 65 6c 20 56 65  Darwin Kernel Ve
0xffffff802f0f6900: 72 73 69 6f 6e 20 31 37 2e 37 2e 30 3a 20 57 65  rsion 17.7.0: We
(lldb)
```

It looks like it continues to <code class="high">0xffffff802f0f6900</code>. Let's dump that too.

```bash
(lldb) x 0xffffff802f0f6900
0xffffff802f0f6900: 65 72 73 69 6f 6e 20 36 39 2e 30 30 20 57 65 65  rsion 17.7.0: We
0xffffff802f0f6910: 64 20 4f 63 74 20 31 30 20 32 33 3a 30 36 3a 31  d Oct 10 23:06:1
(lldb)
```

Nice! See the <code class="high">44 61 72 77 69 6e</code>? That is the hexadecimal representation of the word <code class="high">Darwin</code>. If we change that to let's say "GeoSn0w" in HEX, we can pretty much change the kernel name. Same goes for the version. Let's do it.

So, we need a Text to Hex converter. Many are available online. <a href="http://www.unit-conversion.info/texttools/hexadecimal/">I used this one</a>. And we need to keep in mind that we CANNOT write a longer string without overwriting something else. The word can be smaller and we can pad it with <code class="high">NOPs</code> (0x90) but not longer because it will overwrite stuff. I crafted my text to remove some stuff and add some stuff but I stayed in the same boundary. Don't go past the character limit in the existing string.

<B>My final hex looks like this:</B>

```
47 65 6f 53 6e 30 77 20 4b 65 72 6e 65 6c 20 56 = "GeoSn0w Kernel V"

65 72 73 69 6f 6e 20 36 39 2e 30 30 20 57 65 65 = "ersion 69.00 Wee"
```
Now, we cannot write it to the two addresses like that. We have to add "0x" in front of all characters. The final result looks like this:

```
0x47 0x65 0x6f 0x53 0x6e 0x30 0x77 0x20 0x4b 0x65 0x72 0x6e 0x65 0x6c 0x20 0x56 = "GeoSn0w Kernel V"

0x65 0x72 0x73 0x69 0x6f 0x6e 0x20 0x36 0x39 0x2e 0x30 0x30 0x20 0x57 0x65 0x65 = "ersion 69.00 Wee"
```

Now we can write the bytes to the memory. Let's start with the first address. In my case the command looks like this:

```bash
(lldb) memory write 0xffffff802f0f68f0 0x47 0x65 0x6f 0x53 0x6e 0x30 0x77 0x20 0x4b 0x65 0x72 0x6e 0x65 0x6c 0x20 0x56
(lldb) x 0xffffff802f0f68f0
0xffffff802f0f68f0: 47 65 6f 53 6e 30 77 20 4b 65 72 6e 65 6c 20 56  GeoSn0w Kernel V
0xffffff802f0f6900: 72 73 69 6f 6e 20 31 37 2e 37 2e 30 3a 20 57 65  rsion 17.7.0: We
(lldb)
```

Now for the <code class="high">0xffffff802f0f6900</code> address to complete the string nicely:

```bash
(lldb) memory write 0xffffff802f0f6900 0x65 0x72 0x73 0x69 0x6f 0x6e 0x20 0x36 0x39 0x2e 0x30 0x30 0x20 0x57 0x65 0x65
(lldb) x 0xffffff802f0f6900
0xffffff802f0f6900: 65 72 73 69 6f 6e 20 36 39 2e 30 30 20 57 65 65  ersion 69.00 Wee
0xffffff802f0f6910: 64 20 4f 63 74 20 31 30 20 32 33 3a 30 36 3a 31  d Oct 10 23:06:1
(lldb)
```
Now let's unfreeze the kernel on the debugee:

```bash
(lldb) c
Process 1 resuming
(lldb) Loading 1 kext modules warning: Can't find binary/dSYM for com.apple.driver.AppleXsanScheme (79D5E92F-789E-3C37-BE0E-7D1EAD697DD9)
. done.
Unloading 1 kext modules . done.
Unloading 1 kext modules . done.
(lldb)
```
And let's run the <code class="high">uname -a</code> command in the Terminal of the debugee:

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/49339564-0fc90580-f602-11e8-8142-49852c29a521.png"/>
</p>

And what do you know? It shows our string:

```bash
Last login: Sun Dec  2 07:12:19 on ttys000
Isabella:~ geosn0w$ uname -a
Darwin Isabella.local 17.7.0 GeoSn0w Kernel Version 69.00 Weed Oct 10 23:06:14 PDT 2018; root:xnu-4570.71.13~1/DEVELOPMENT_X86_64 x86_64
Isabella:~ geosn0w$ 
```

And there you have it. Kernel debugging on macOS with some practical examples. I hope you enjoyed it. Do not forget that, after you're done debugging stuff you should set the <code class="high">boot-args</code> back again to stock to boot the normal <code class="high">RELEASE</code> kernel. You do that by running the following command in Terminal on the debugee: <code class="high">sudo nvram boot-args=""</code>. Then go to <code class="high">/System/Library/Kernels/</code> and remove the <code class="high">kernel.development</code> file. 

```bash
Isabella:~ geosn0w$ sudo nvram boot-args=""
Password:
Isabella:~ geosn0w$ 
```
Now in the Terminal write the following two commands to invalidate the kextcache:

```bash
sudo touch /Library/Extensions
```
And

```bash
sudo touch /System/Library/Extensions
```

After this, perform a reboot and the computer will boot the normal <code class="high">RELEASE</code> kernel.

### Errare humanum est
If you found any horrible mistakes in this write-up, let me know on Twitter. My handle is @FCE365 (GeoSn0w). Thank you a lot for reading this!

### Contact me

<ul>
<li>Twitter: https://twitter/FCE365</li>
<li>YouTube Channel: http://youtube.com/fce365official</li>
</ul>

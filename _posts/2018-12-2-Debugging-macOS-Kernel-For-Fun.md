Hi there! It's GeoSn0w. Debugging the damn kernel is a very fun thing to do (until you provoke a serious exception, that is). Unfortunately, it's not an easy task nowadays and Apple seems to want to make harder and harder. At first, by hiding under lock and key the documnetation about the <code class="high">debug</code> boot arguments, and then by moving the Kernel Debug Kit under the Developer Account-only Downloads section. There are many write-ups on the internet about debugging the kernel on macOS but many of them are outdated as hell and the nvram boot arguments they tell you to set are no longer working. Some of them stop at just the "now you should have a working debug session" - so what? what do I do next? I wanna have fun Goddammit! In this write-up I am doing my best to provide the most accurate information for 2019, the right commands, the right <code class="high">boot-args</code> and of course, practical examples you can begin with.

### A note for the l33t h4xxors
If you are going to say "well if people don't know what to do with a kernel debugger they shouldn't use one", please segfault. You've been a beginner once and wanted to have fun and learn so shut up.

### Getting started with Kernel debugging on macOS
Okay, so the first things we need to sort out is the lab. You need to have a device of which kernel you want to debug (in my case I am using my iMac 2011 as a debugee) and a device from where you do the debugging (I am using my MacBook Pro 2009 for this). You can connect the two in various ways I will discuss in this write-up, but in my case the best method (and the most reliable) seems to be via a FireWare cable between the two (that is because both my machines have actual firewire ports, not USB-C bullshit).

With the hardware part set up, we need some software. You CAN theoretically debug the <code class="high">RELEASE</code> kernel, but when you're a beginner the <code class="high">Development</code> one is much better. By default, macOS comes with a <code class="high">RELEASE</code> fused kernel located in <code class="high">/System/Library/Kernels/kernel</code> where <code class="high">kernel</code> is a <code class="high">Mach-O 64-bit executable x86_64</code>. We can get ourselves the <code class="high">Development</code> kernel for our macOS version by navigating to Apple Developer portal and downloading the Kernel Debug Kit. It's surprising that Apple only put the kit under a normal, free Apple Developer Account lock; I would have expected them to put it under the paid Apple Developer Account downloads by now.

Anyways, once you navigate to this <a href="https://developer.apple.com/downloads/index.action?q=Kernel%20Debug%20Kit">Apple Developer Portal Downloads</a> section, you will see something like this:

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/49338190-7ba07380-f5ec-11e8-84bf-69e26c5715bf.png"/>
</p>

<b>VERY IMPORTANT!</b> You should get the appropriate kernel debug kit for your specific macOS version! You will boot the downloaded kernel later and if it doesn't match your macOS version, it will NOT boot! I am not responsible for any damages to your files, computer, life, cat, whatever. Proceed at your own risk.

### Finding the proper Kernel Debug Kit for your macOS version [!]
In order to locate the proper Kernel Debug Kit, you must know your macOS version and the actual build number. You can easily see what macOS version you are running by going to the Apple logo, pressing "About This Mac", and reading the version in the window that appears, for example "Version 10.13.6". 

For the actual build number, you can either click once on the "Version" label in that "About This Mac" window, or you can run the terminal command <code class="high">sw_vers | grep BuildVersion</code>. In my case running the command outputs "BuildVersion:	17G65".

```bash
Last login: Sun Dec  2 03:58:16 on ttys000
Isabella:~ geosn0w$ sw_vers | grep BuildVersion
BuildVersion:	17G65
Isabella:~ geosn0w$ 
```
So, in my case I am running macOS High Sierra (10.13.6) build number 17G65. Looking in the Downloads section I could immediately find my version listed so I can download the .DMG file containing the installation files. The download is pretty small.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/49338318-93c4c280-f5ed-11e8-84ef-5313af537f9a.png"/>
</p>

### Preparing the debugee for being debugged by the debugger ;)
With the Debug Kit downloaded on the debugee (that is the machine you whose kernel you wanna debug), mount the DMG file by double-clicking on it. Inside the DMG you will find a file called <code class="high">KernelDebugKit.pkg</code>. Double-click that and follow the installation wizard. It will ask you for your macOS login password. If asked, do not move the installer to trash. You will need it later.

When the installation is complete it will look something like this.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/49338411-c02d0e80-f5ee-11e8-863d-2c7cda6acf93.png"/>
</p>

After the installation completes, navigate to <code class="high">/Library/Developer/KDKs</code>. There you will have a folder named <code class="high">KDK_YOUR_VERSION_BUILDNUMBER.kdk</code>. In my case the folder is called <code class="high">KDK_10.13.6_17G65.kdk</code>. Open the folder and inside it you will find another folder called "System". Navigate into the folder, then into "Library" and then into "Kernels". In that folder you will find a few kernel binaries, some Xcode Debug Symbol files (.dSYM), etc. You are interested in the file called <code class="high">kernel.development</code>.
  
Copy the <code class="high">kernel.development</code> and paste into <code class="high">/System/Library/Kernels/</code> alongside your release kernel binary. When you are done, you should have two kernels on your macOS installation, a <code class="high">RELEASE</code> one and a <code class="high">DEVELOPMENT</code> one.

### Disabling SIP on the debugee
For proper debugging, you may need to disable <code class="high">SIP (System Integrity Protection)</code> on the machine whose kernel you wanna debug. To do that, reboot the machine in <code class="high">Recovery Mode</code>. To do that, reboot the machine and when you hear the "BOONG!", or when the screen turns on, press <code class="high">CMD + R</code>. Wait a few seconds for it to boot into Recovery Mode user interface, and open "Terminal" from the top bar.

In the Recovery Terminal, write <code class="high">csrutil disable</code>. Then reboot the machine and boot it normally to macOS.

### Setting the correct NVRAM boot-args as of 2018/2019
The <code class="high">boot-args</code> have been changed during the years by Apple so what you find on the internet may or may not work depending on how old the write-up is. The following <code class="high">boot-args</code> have been tested and are working with macOS High Sierra as of 2018.

<B>NOTE!</B> The following <code class="high">boot-args</code> assume you are doing this over FireWare or via FireWare through Thunderbolt adpter.

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

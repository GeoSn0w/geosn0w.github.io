---
title: Understanding iOS Tweaks and Battery Draining
layout: post
---

Recently I got in a heated discussion with a friend about tweaks and how a seemingly benign tweak that does nothing but to change a <code class="high">.plist</code> file can actually become a vector for serious battery draining. While discussing with the person about TetherMe, a tweak which unlocks the cellular data tethering, in the context of battery drain, I realized that some people only see one single dimension of a specific action which could potentially be a problem when you install tweaks. Let's dive a bit into the idea of batter draining in the context of jailbreak tweaks.

### About the TetherMe discussion
I'll start with TetherMe since it was the subject of a heated discussion between me and Pwn20wnd. See, there are some carriers that simply do not allow enabling the Tethering function. On a normal non-jailbroken device there's no way to circumvent the carrier-imposed lock so you won't be able to activate tethering which means power consumption of 0 due to tethering.

When jailbroken, you can install a tweak called <code class="high">TetherMe</code> (which is a great tweak by the way) that can circumvent the lock. The tweak itself does not drain any battery, but since you've installed it's likely you want to use tethering and that will drain more power. How much power? Depends on how much you use the tethering, but the idea is that you now have the potential to draw more power which you didn't have before installing the tweak. It's just a matter of the perspective.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/54457638-33076300-4762-11e9-9c7b-76b7b9a86a03.png">
</p>

So the bottom line here? Yes, <code class="high">TetherMe</code> will draw close to no power, but what it allows you to do (circumvent carrier restrictions to activate and use unlimited tethering) has the potential to create more power draining. And yes, you will say "well that is fucking obvious, isn't it?" Well, not for everyone. I was just asked if WiFi shouldn't be drawing more power than Cellular Data (4G)... Some people really believe that they install the tweak to unlock the feature, enable the tethering thanks to it and the battery consumption will not be noticeable just because the tweak just unlocks an iOS feature.

### Theming and graphically intensive tweaks
When jailbreaking your device, you may be like me and use the jailbreak for <code class="high">SSH</code>, file management and research, or you may be interested in the fun part of jailbreaking and install an awful lot of tweaks to customize every single part of iOS. While that can render the device of your dreams with everything looking exactly the way you'd love it to be, tweaks that add graphical elements tend to consume much more power. Take <code class="high">XenHTML</code> for example. It's a nice tweak which allows a high degree of customization, but for that to be possible there's extra memory used, extra CPU used, extra GPU used which would not be the case on stock iOS. Does it look good? Yes. Does it draw more power? Yes. The problem with XenHTML is not Xen itself but the Widgets people install. Some widgets are very aggresive to the battery while others result in close to no battery consumption. Tweaks that add Always-On displays, animations, extra graphical elements on the springboard and so on, tend to increase the battery consumption. Lockscreens, widgets, Imagine them like having extra apps running and eating the phone resources. The more tweaks the more consumption.

! WARNING! XenHTML itself (the bare tweak) does consume any significant power. It's the widgets people install that can be very aggresive to the battery. Xen itself has a battery management feature built-in, however, it's up to the widgets developers to ensure their XenHTML widgets don't become battery hogs.

### Other sources of battery drain
Many people report tweaks like Activator and Smart Tap to create visible battery draining. That is normal. With such tweaks comes more computation. More things working in the background, more hooking. The more tweaks you have, the more battery consumption and this stays true especially for tweaks that are always active in the background or in the foreground. On older devices tweaks like IntelliScreenX and Winterboard can draw a lot of battery, and in general, tweaks that connect to the internet will add extra battery draining (and potentially even Data charges if you are not careful).

### DRMs and battery draining
That some tweaks nowadays use a sort of <code class="high">DRM (Digital Rights Management)</code> is not something new, however, depending on how the DRM is implemented it has the potential to do serious battery drain. See, if the DRM is constantly connecting to the internet to verify whatever license, it will consume more battery and potentially drive some Data charges too if you are not careful. Most DRMs I've seen on tweaks are a check that happens once, but it's certainly possible to code your tweak to check constantly. This is a bad practice and only hurts the loyal customers of the tweak, but I won't get into the ethics of using DRMs in this post.

### Does jailbreaking itself draws more power?
Even though some people believe it's not the case, yes, jailbreaking draws some power. Nowadays jailbreaks use various daemons that run in the background to ensure that a specific iOS security feature is debilitated or as part of a jailbreak component (signing, etc.). Compared to stock iOS there's more stuff running in the background and there will be more battery draining as well. Electra Jailbreak was noticeably known for being a serious battery hog. Whether due to the active components running in the background or because of the quality of the code, many people complained about it draining more battery. 

Unfortunately, it's not easy to estimate how much does the extra processing consume because it won't appear in the battery settings, but on decent jailbreaks like Unc0ver it should not be a major battery drain. In fact, without any tweaks, Unc0ver itself draws a negligible amount of power. Keep in mind that just because it's not major doesn't mean the consumption is the same as stock iOS.

Now, the most battery drain will be from what you install using that jailbreak, not from the jailbreak components themselves (unless you use Electra), so usually, you should pay attention to what tweaks you install and do not install too many of them. Only what you find necessary. Anything that you don't use but is enabled will draw a bit of power, use memory and CPU and result in some resources consumption you can simply avoid.

### Is it a good idea to keep the phone plugged in all the times?
In short, no. Lithium batteries do not like to stay at 100% all the time. It's a state of high stress for the battery and it will eventually wear out losing its capacity to hold the charge. If you wanna store a phone you're no longer using in a drawer, do not charge it to 100% and turn it off. It will hurt the battery in the long run. Charge it to about 55% and then turn it off. Same applies for completely discharging the battery before storing the phone. Don't do that. Lithium batteries do not like the extreme states (Very low or very high power) for long periods of time.

Now, don't expect that keeping it mostly plugged in while using it will damage the battery right away, but you will notice the battery health counter in the Battery Settings going down considerably after one year if you keep doing so. Now, Lithium batteries are consumables and they wear a tiny bit with every single full charging cycle they receive. <a href="https://www.apple.com/batteries/why-lithium-ion/">Original iPhone batteries are designed to hold at least 80% of the original capacity for a high number of charge cycles, which varies depending on the product</a>.

While the battery's capacity to hold a charge diminishes over time, you don't get to charge to a lower battery percentage, that's why some people believe their battery is completely fine. But here's the thing: a new battery will hold much more charge at 100% than an old worn out battery. It's 100% from the capacity of the battery that is still left which is decreasing a bit with every charge. Let's say that you have a 3000 mAh battery. When charged 100% it will be close to 3000 mAh. In time, the battery capacity will wear out and instead of 3000 mAh, it will hold only 1600 mAh (for example). You will still see that your phone has charged to 100%, but 100% now means 1600 mAh, not 3000 mAh as it was the case when the battery was new. That's why it lasts less.

There are multiple factors that contribute to the wearing of the battery, including keeping the battery in high state of charge, keeping the charger plugged in all the times, using battery-draining apps / tweaks (because it makes you charge much often and you lose battery capacity with every charge cycle) and even operating the battery at low or high temperatures. Lithium batteries are very easily damaged.

### Should I jailbreak if my battery is already holding considerably less charge than when it was new?
That's entirely up to you, but if you have an already worn out battery (for example you've had your phone for 3 years and you've been using it daily), you should keep in mind that jailbreaking will only make matters a bit worse. While many tweaks do not consume a ton of power, many interesting ones like <code class="high">Anemone 2</code> (for theming) would. Add that to the already worn out battery and sprinkle a bit of cellular data connection and you'll suddenly realize that you won't make it through the day without a portable charger. Should you stop jailbreaking? Not necessarily, but I'd be more cautious on what I install and I'd avoid battery hogs like lockscreens, widgets or <code class="high">Anemone 2</code>. 

### How can I tell if tweaks draw more battery on my setup?
A common way to do this is to use the command <code class="high">top -o cpu</code> via <code class="high">SSH</code> or using NewTerm2. It will show up which daemons or processes hog the CPU and thus drain the battery quicker. On my setup with all tweaks disabled the <code class="high">backboardd</code> daemon for example runs at about 16-20%. With all the tweaks enabled it hogs the CPU to about 63-68% that is much more. In my setup <code class="high">XenHTML</code> causes the biggest battery drain followed by <code class="high">Anemone 2</code> and <code class="high">Activator</code>.

### Conclusions
While jailbreaking is fun and gives you enormous power over your device, with great power comes great responsibility. It's not possible to have no additional battery consumption if you are jailbroken compared to if you're stock, and the amount of extra battery draining you'll see depends on multiple factors such as the number of tweaks you've installed, how much you use the phone, if you use tethering and mobile data, if you use graphically-intensive tweaks, the battery wear level and the quality of the jailbreak. That doesn't mean you should not jailbreak your device. It just means you should be careful what you install and you should always assess your battery health in <code class="high">Settings > Battery > Battery Health</code>. 

Remember that when you are jailbroken you add more processes and more resource eating tasks on top of the stock iOS ones so there will be more battery draining. For some people with new devices and good batteries the draining may not be very noticeable, but the older the battery is, the more you'll feel the diminished capacity to hold the charge. 

### Contact

* Twitter: <a href="https://twitter.com/FCE365">GeoSn0w 

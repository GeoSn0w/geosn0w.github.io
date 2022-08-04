---
layout: post
title: Hacking the Dino Game from Google Chrome, The Immortal Dinosaur
---

When there is no internet connection available, Google Chrome web browser on Windows and macOS (most likely on Linux too) shows up a page detailing the possible causes as well as a small endless runner game with a dinosaur that has to run, dodge obstacles and accumulate points. The game is relatively simple-minded. A monochrome game area with clouds, cacti, bumps in the ground, a dinosaur, a Hi-Score counter and a current score counter. As levels increase in complexity, the dinosaur will have to dodge cacti, pterodactyls, and so on. The game also inverts the contrast at random points making the background black and the creatures white to simulate a night mode and at the same time to draw player's attention to the background change making it harder to play for a second, which could prove fatal.

### Undocumented Features
There's an undocumented full-screen mode. Undocumented as in "there's no button to switch to that mode". The mode can be enabled if you access the game directly from its internal Chrome URL, that is `chrome://dino`.

### Exploring hacking possibilities
Since the game itself is mostly written in JavaScript, it makes hacking very easy. Google Chrome's built-in Developer Tools contain a console where you can inject code, a debugger, and many other tools that you can find very useful. For the sake of not having the game in full screen, I will disconnect MacBook from the WiFi station and I'll start tinkering with the game. Keep in mind that this is my original route I followed to hack the game initially while my internet was down one day.

### Monitoring the game logic
By starting the game and opening the "Inspect Element" menu, we can see that the game runs in a div class called "runner-container". In the right side, we have the "Styles" where CSS is shown. There are a couple "runner-container" components. If we click the "index.NUMBER", we're brought to a sub-menu containing a debugger. We can pause, step, run and so on. Let's restart the game and quickly pause it using the debugger.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/40609789-c7837376-623d-11e8-8a07-8926d31258e8.png"/>
</p>

Great! Now it says "Paused in debugger". We've also got our first bits of information about the game on the debugger. There is a function called "Runner" with a lot of components that seem to be related to the game logic. Here are some of the components inside the "Runner" function. Amongst other stuff, in the "__proto__" you can see a function called "gameOver()"

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/40610200-6a65f432-623f-11e8-8e0e-de418a4263b3.png"/>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/40609799-cade4da2-623d-11e8-874f-431d82adb0e6.png"/>
</p>

### Hacking the game

As we identified earlier, there is a function prototype called "gameOver()" that handles exactly what it claims. The original code of the function is the following:

```js
function() {
    this.playSound(this.soundFx.HIT);
    vibrate(200);

    this.stop();
    this.crashed = true;
    this.distanceMeter.achievement = false;

    this.tRex.update(100, Trex.status.CRASHED);

    // Game over panel.
    if (!this.gameOverPanel) {
      this.gameOverPanel = new GameOverPanel(this.canvas,
          this.spriteDef.TEXT_SPRITE, this.spriteDef.RESTART,
          this.dimensions);
    } else {
      this.gameOverPanel.draw();
    }

    // Update the high score.
    if (this.distanceRan > this.highestScore) {
      this.highestScore = Math.ceil(this.distanceRan);
      this.distanceMeter.setHighScore(this.highestScore);
    }

    // Reset the time clock.
    this.time = getTimeStamp();
  }
```

Now that we know how the game handles the collision and the "Game Over" scenario resulted from a collision, we can patch the function using the aforementioned console.
All we need to do is to close the debugger, reload the page, right-click on "Inspect Element" and navigate to the Console. We know that the main function is called "Runner" and the targeted function is called "gameOver". All we need to do is to overwrite the code of the "gameOver()" function to be nothing so that the game will go on and on. Before we do that, we store the original function in a dummy variable.

In console we'll write:
```js
var dummy = Runner.prototype.gameOver
Runner.prototype.gameOver = function(){
}
```
At this point, the Dinosaur will be able to simply go through all the obstacles.
Let's fiddle a bit with the speed of the game too. To do that we play with another function called "setSpeed()" which accepts a number. By changing the value we can change the speed of our dinosaur and get score faster. The maximum score the game gives you is 99999 before it resets back to 0.

In console we'll write:

```js
Runner.instance_.setSpeed(6000)
```
This will change the speed of the dinosaur to 6000. You can use any other number.

### Undocumented trick
I've discovered this trick accidentally, but it is pretty neat. Changing the speed to "-1" will make the dinosaur to go backward and the entire game scene follows its backward movement. LOL.

To do that, in the console we'll write:

```js
Runner.instance_.setSpeed(-1)
```
Of course, if you wanna get busy with the game, you should be able to change the sprites too. The same methodology should apply.
Since your game no longer has a collision stop mechanism, it will run forever. If you want to stop it, you need to employ the Console again.

To do that, in the console we'll write:

```js
Runner.prototype.gameOver = dummy
```

This will replace our modified "gameOver" function with the factory content and will, therefore, bring back a working collision detection and "Game Over" to the game.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/40609987-869df9a2-623e-11e8-8195-01eee9a672a4.png"/>
</p>

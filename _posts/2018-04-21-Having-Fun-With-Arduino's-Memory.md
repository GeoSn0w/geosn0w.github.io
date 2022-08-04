---
layout: post
title: Having Fun With Arduino's Memory
---
Hello everyone, GeoSn0w here! There are times when you need to take a closer look at the address space of your Arduino development board. 
Small sketches may or may not render memory problems depending on the Arduino board you've got, but a fairly complex project can 
easily chew through the SRAM available and multiple allocations and deallocations using `malloc()` and `free()` may result in 
memory issues because the available free chunks may not be big enough to hold what you're about to allocate.

In situations like these, it's recommended to keep an eye on the memory, the way data is positioned, and how you can optimize it.

### A matter of memory

As you probably know, Arduino boards, especially the `AVR` ones, don't come with an awful lot of memory. They're intended for relatively small projects (or very well optimized ones - that's the beauty of working that close to the hardware). To better illustrate the memory problems that can occur, I've composed the following table containing the built-in SRAM, EEPROM, Flash and the architecture of
the most common Arduino boards.

<p align="center">
  <img src="https://raw.githubusercontent.com/GeoSn0w/geosn0w.github.io/master/images/arduino.png"/>
</p>

### Playing around
Now that is clear that Arduino's SRAM is nowhere near enough for beefy projects, let's see how we can peek into it, optimize it and have fun with it. This may be obvious for some people, but just in case, when talking Arduino (especially the lower-end models with less than 4 KB of SRAM), you should avoid excessively using `malloc()` and `free()`. It's usually better (of course, if possible) to avoid dynamic memory allocation on Arduino because if the sketch is big enough, after enough allocations and deallocations, the memory will become fragmented and further allocations may fail because there is not enough memory available. Thing is, there might still be enough memory but not grouped in free chunk big enough for the allocation to proceed.

I know that this whole memory concept may sound confusing for the beginners, so I'll try to build a diagram that should be able to demonstrate how this phenomenon occurs.

<p align="center">
  <img src="https://raw.githubusercontent.com/GeoSn0w/geosn0w.github.io/master/images/memory%20segmentation%20on%20arduino.png"/>
</p>
  
As you can see, multiple allocations and deallocations can result in free chunks in between allocated chunks. These free chunks can still be used if what you want to allocate is smaller or equal to the size of the free chunk. If it is bigger, the allocation will seek a bigger free chunk. In our diagram, that'd be in the right corner right after the 3rd allocated block, but if we allocate and deallocate a bit more, it will quickly build free chunks that may not be big enough, therefore, making the allocation to fail.

### What can you do?
Depending on what kind of project you want to create, you may find the following good practices useful.
If you are working with strings (`char arrays`), you may wanna use the `F()` macro. To do that you transform your code from:

```c
setup(){
  Serial.print("Hello my name is George and I like to code.");
}
```

Into:

```c
setup(){
  Serial.print(F("Hello my name is George and I like to code."));
}
```
The `F()` macro pretty much puts your string on the Flash (code space) instead of putting it on the SRAM. The amount of flash your Arduino has is bigger than the amount of SRAM so that makes total sense. The way `F()` does that is quite complex but I will try to summarize it. I will take for this example the Arduino Mega 2560 which is `AVR` architecture. The `AVR` architecture is a Harvard Architecture and therefore, the `code` and the `data` are stored separately. Normally, when you call functions like `print()` or `Serial.print()` you pass a `char*` (Character Pointer) to them. This is pretty much the beginning (base) address of the character array holding your string on the flash. However, there is a problem. As you can see, `char*` is a pointer. In order to use whatever the pointer points to, you need to dereference it. When you dereference the pointer it will attempt to return the character stored in the SRAM (Data Space) instead of Flash (Code Space). What `F()` does is to pass a `__FlashStringHelper*` instead of a `char*`, this way pointing the function to the correct location (the code space).

This saves you quite a lot of memory. You can actually test this yourself. If you have an Arduino UNO, try creating 5-6 `character arrays` and hold a medium size sentence in each of them. You will see how much memory it chews. After that, use the `F()` macro and spot the difference.

Keep in mind that once you put your Data on the `Flash`, you can't modify it at run-time. This is only recommended if the data is constant.

Another good tip for memory optimization is to take advantage of the `PROGMEM` for your constants. If you have a lot of constants the `PROGMEM` does wonders as it prevents the data declared in it from being copied into the SRAM at boot-time. 
All you need to do is to include the correct header:

```c
#include <avr/pgmspace.h>
```

And use it:
```c
const char hello[] PROGMEM  = {"My name is George and I like to code Arduinos"};
```

The official <a href = "https://www.arduino.cc/reference/en/language/variables/utilities/progmem/"> Arduino Documentation </a> is pretty useful if you want to get started with `PROGMEM` for your constants. 

### Maybe get into local variables?
Let's assume this code:

```c
int begin = 64;
void printNumbers(int beginNo){
  int firstNumber = 4;
  int secondNumber = 45;
  float thirdNumber = 4.43;
  Serial.print(firstNumber);
}
setup(){
  Serial.begin(9600);
  printNumbers(begin);
}
```
When you call a function, for example `printNumbers(int beginNo)`, the function creates its own `Stack Frame`. What does it contain? Well, everything you pass to the function (its parameters) and all local variables that are declared within the function's scope. This makes the `Stack` to grow towards the `Heap`. What is declared inside the function can only be used inside the scope of that function. This means that an external function will not be able to use any of the integers or the float we've declared inside the function. These variables will only live as long as the function is alive. Once the function finishes, its `stack frame` is `popped` off the stack and the entire space utilized by the function and its variables is reclaimed (the stack shrinks).

There is still a problem. If you grow your stack too much towards the heap, you run the risk of smashing them one in the other so be careful. Don't build useless variables that don't get used.

To help illustrate the memory map and how the `Stack` and the `Heap` look like, I've built yet another diagram.

<p align="center">
  <img src="https://raw.githubusercontent.com/GeoSn0w/geosn0w.github.io/master/images/memmap.png"/>
</p>

### Obtaining the address of a variable in the memory
Arduino, like all other systems, puts each variable at its specific address in the memory so that it can be retrieved and used when needed. The addresses are represented in hexadecimal numbers prefixed by `0x`. For example: `0x21D8` is currently the address of a variable I've created. On systems like your computer, your phone, your tablet, etc. most operating systems use a concept called `ASLR` or Address Space Layout Randomization. This concept pretty much puts the data and the code segments at different locations in the memory every time you power on the device or every time you start the program. By randomizing the addresses where the stuff can be found in the memory, a protection layer is implemented. The idea is that the harder is for a hacker to find what he wants to hack in the memory, the more time and the more knowledge it would take to hack the system. Of course, that's in theory. In real life, `ASLR` can easily be defeated by provoking an `info leak`. It's enough to be able to leak a pointer in order to be able to calculate the `ASLR Slide` and with that, the randomized position of each function, variable, etc. you wanna patch in memory. 

Kernels like `XNU`, the Linux Kernel, Windows Kernel, and so on also implement this at boot-time (usually from the `bootloader` side) but it is called `kASLR` or Kernel Address Space Layout Randomization. The same theory applies. The whole kernel is randomized in the memory to prevent the hacker from knowing where in the memory is the function he wants to hack. Leak a `Kernel Pointer` and calculate the `slide`, use a disassembler like Hopper, Radare2 or IDA Pro to gather the unslid address of the function you're interested in, and you've defeated KASLR.

Arduino doesn't implement ASLR. The address space isn't randomized here, but the location of your variables will change from a project flashing to another.

On Arduino, the easiest way to obtain the address of a variable or a function in the memory is to take advantage of the pointers. Let's assume this code:

```c
int helloWorldFunction(){
  Serial.print("Hello world");
  return 0;
}
int getAddressOfFunction(){
  int (*functionPointer)(void) = &helloWorldFunction;
  Serial.print("The address of the helloWorldFunction() is 0x");
  Serial.print( (int) functionPointer,HEX);
  return 0;
}
setup(){
  Serialbegin(9600);
  helloWorldFunction();
  getAddressOfFunction();
}
```
This code will hapily print the address where the function `helloWorldFunction` resides in the memory. To get the address, we use the `&` operator. The pointer can point to a function that returns an `int` and has no parameters `(void)` passed to it. We also need to cast the pointer to `int` by doing `(int) functionPointer` when we print it. Finally, the `HEX` means that we want to print the address in hexadecimal format.

### Peeking into the memory
If you want to obtain the address of the Stack Pointer and the Heap Pointer, it's pretty simple.
Let's assume this code:

```c
uint8_t * HeapPointer, * StackPointer; // Globally declaring the Stack and Heap pointers.
int getPointers(){
  StackPointer = (uint8_t *)malloc(4); //We do a small allocation.
  HeapPointer = StackPointer; // We save the value of the heap pointer.
  free(StackPointer); // We use the dreaded free() to zero the StackPointer.
  StackPointer = (uint8_t *)(SP); //Get the Stack Pointer
  return 0;
}
setup(){
  Serial.begin(9600);
  Serial.print("0x");
  Serial.print((int) StackPointer, HEX);
  Serial.print("0x");
  Serial.print((int) HeapPointer, HEX);
}
```

The following code should happily print the `Stack Pointer` and the `Heap Pointer`. The code is inspired from the Arduino Forums (with some personal modifications).
I hope this write-up helps. Took me a while to put it together but I hope it will come in handy for somebody some day.

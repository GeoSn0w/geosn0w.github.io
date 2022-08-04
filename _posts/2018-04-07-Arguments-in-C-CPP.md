---
layout: post
title: How to implement program arguments and how they are parsed in C/C++
---
C and C++ offer a big level of freedom to the programmer. That is efficiently dangerous, as the programmer has to know what he is doing.
Computers are deterministic machines. They do what they are told to do, and if what they're told is wrong, they will most likely
proceed anyways. While C and C++ compilers do warn programmers and in some cases even refuse to compile, that only happens if the grammar errors (as in programming language grammar) are found.
Don't expect the compiler to try to guess what you try to do. It will assume you know what you try to implement and will not check your code logic for anything other than grammar errors or type errors.
In this post, I will go to the lengths of how you can implement arguments in your program and how they work.

###### Implementation

You may scratch your head saying "gee, what has that abstract to do with the topic?". Well, as the compiler assumes you know what you are doing, it will also assume you programmed whatever functions you need.
By default, starting a program `program` with the arguments `-debug -toFile` will do absolutely nothing to the program because a computer is a deterministic machine and it will not implement argument parsing in your program for you.
And even when you do remember that all the functions in a program must be created by a programmer, you can still fail spectacularly.
Arguments in a program may not seem like a big deal, they're pretty beginner things, right? right??? guys??

We often implement the `main()` function something like this, but why?
```c
int main(int argc, char *argv[]){
  return 0;
}
```
What means `argc` and why is it an `int`? What means `argv` and why is it a `pointer` to a `char array`?
See? You may know how to make your program to accept arguments at load-time but you don't know the inner workings.

`argc` is a name we give to `argument counter`, while `argv` stands for `argument list` otherwise known as `argument vector`.

The reason we need to keep track of how many arguments the user has passed to the program becomes visible when you begin to understand that to a computer, your program is nothing but memory addresses containing stuff. At some point in the life of your program, you want to do something with the arguments the user has supplied, being that a check, a comparison or anything else.
To do that, you parse let's say the `3rd array element` from the `argv` which is the `char array` in which the user supplied arguments are being stored. Naturally, that array is located at a memory address within the bounds of your program. The problem will become visible in a second. 

Let's assume:

```c
#include <stdio.h>
#include <stdlib.h> //for exit()

void howtoUse(char *ourProgram){
    printf("Usage: %s, <your name> <your age>\n", ourProgram);
    exit(1); //Terminate the program
}
int main(int argc, char *argv[]){
    //Begin of safety check
    if (argc < 3){ //If the user supplied fewer arguments than we need...
        howtoUse(argv[0]); //We pass the program name as argument 0.
    }
    //End of safety check
    int age = atoi(argv[2]); //ASCII to INTEGER (atoi).
    printf("Your name is %s and you are %d years old.\n", argv[1], age);
    return 0;
}
```
Ok, so this is a simple program I wrote. It will accept two arguments: a name and a number for the age.
Naturally, we start the program with the required arguments:

```
MacBook-Pro-van-Mac:~ mac$ /Users/mac/Desktop/file George 29
Your name is George and you are 29 years old.
MacBook-Pro-van-Mac:~ mac$ 
```

This is exactly the expected behavior. 
We got the arguments and we used them during the life of the program.
What happens if the user forgets to supply the arguments? Or an argument? Or a space between arguments? Or too many arguments?
Well, since we do have a safety check based on comparing `argc` with the number of arguments we should have (3) we can stop an error.

Wait! Why 3 arguments? We ask only for 2!?
Well, not really. `argv[0]` will always be the name of the program and the user-supplied arguments start from `argv[1]`. 2 user-supplied arguments and argument 0 which is the program name result in 3 total arguments in the `char array`.

Let's see what happens if we only supply one argument:

```
MacBook-Pro-van-Mac:~ mac$ /Users/mac/Desktop/file George
Usage: /Users/mac/Desktop/file, <your name> <your age>
MacBook-Pro-van-Mac:~ mac$ 
```

Naturally, our small `if()` check saved the program from crashing into oblivion and let it safely quit.
Let's remove the safety check -- ooh, dangerous :P

```c
#include <stdio.h>
#include <stdlib.h> //for exit()

void howtoUse(char *ourProgram){
    printf("Usage: %s, <your name> <your age>\n", ourProgram);
    exit(1); //Terminate the program
}
int main(int argc, char *argv[]){
    //No safety check. This is sooo gonna crash.
    int age = atoi(argv[2]); //ASCII to INTEGER (atoi).
    printf("Your name is %s and you are %d years old.\n", argv[1], age);
    return 0;
}
```

The program will still operate normally while the required number of arguments are supplied, however, once the user makes a mistake, it will take the program with it.

```
MacBook-Pro-van-Mac:~ mac$ /Users/mac/Desktop/file George
Segmentation fault: 11
MacBook-Pro-van-Mac:~ mac$ 
```

Sure enough, our program crashed into oblivion with a darn `SEGFAULT`. 
A `SEGFAULT` means your program tries to access a memory region it is not supposed to access. The memory is split into segments, your program has access to some given segments and it will work just fine. Once it tries to read/write to segments it has no access to (beyond the boundaries), it will crash.

Let's see what happened through the magic of a debugger, shall we?

```
MacBook-Pro-van-Mac:~ mac$ sudo gdb -q ./a.out
Reading symbols from ./a.out...Reading symbols from /Users/mac/a.out.dSYM/Contents/Resources/DWARF/a.out...done.
done.
(gdb) run George
Starting program: /Users/mac/a.out George

Program received signal SIGSEGV, Segmentation fault.
0x00007fff9f6fb48b in strtol_l () from /usr/lib/system/libsystem_c.dylib
(gdb) break main
Breakpoint 1 at 0x100000ee6: file /Users/mac/Desktop/file.c, line 11.
(gdb) run George
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /Users/mac/a.out George

Breakpoint 1, main (argc=2, argv=0x7fff5fbffca0) at /Users/mac/Desktop/file.c:11
11        int age = atoi(argv[2]); //ASCII to INTEGER (atoi).
(gdb) info registers
rax            0x100000ed0    4294971088
rbx            0x0    0
rcx            0x7fff5fbffd58    140734799805784
rdx            0x7fff5fbffcb8    140734799805624
rsi            0x7fff5fbffca0    140734799805600
rdi            0x2    2
rbp            0x7fff5fbffc80    0x7fff5fbffc80
rsp            0x7fff5fbffc60    0x7fff5fbffc60
r8             0x0    0
r9             0x7fff7e0a20c8    140735307981000
r10            0xffffffff    4294967295
r11            0xffffffff00000000    -4294967296
r12            0x0    0
r13            0x0    0
r14            0x0    0
r15            0x0    0
rip            0x100000ee6    0x100000ee6 <main+22>
eflags         0x206    [ PF IF ]
cs             0x2b    43
ss             <unavailable>
ds             <unavailable>
es             <unavailable>
fs             0x0    0
---Type <return> to continue, or q <return> to quit---
gs             0x0    0
(gdb) cont
Continuing.

Program received signal SIGSEGV, Segmentation fault.
0x00007fff9f6fb48b in strtol_l () from /usr/lib/system/libsystem_c.dylib
```

It becomes quite clear that our program went a bit overboard. Without proper checks on the arguments, when our program tries to work with that variable it will try to access an address to a chunk of memory it has never been granted permission to put stuff in, and will, therefore, crash spectacularly.

I hope this write-up helps future programmers. Have fun and always check user input! NEVER trust user input.

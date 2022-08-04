---
layout: post
title: An introduction to x86 Intel Assembly For Reverse Engineering
---

When I first started Reverse Engineering, I was looking into something, to begin with. I eventually decided to start with understanding assembly because after all, that's the best you can get when the source code isn't publicly available unless you find pleasure in reading 1s and 0s or HEX dumps. A few decades ago, a lot of software used to be written in assembly language specific to the CPUs at the time. 

I remember writing assembly code for the 6502 CPU back on the Commodore 64 because sometimes, the BASIC was just too slow. It wasn't really fun. Nowadays, high-level programming languages are way better in terms of speed and ease of use, however, the assembly language is still actively used where very good control over the hardware has to be achieved and for reverse engineering.

Reverse Engineering is, basically, just a better understand of computers and how they work. You don't essentially learn how to hack or how to reverse engineer, you just learn how computer work. When I first started, I needed to choose a platform because Reverse Engineering can involve different steps depending on the target CPU. I started with Intel x86 (IA-32). This is what I am going to cover in this write-up, and hopefully, this will help beginners understand the basics a bit better.

### Nota Bene!

A very important thing you need to keep in mind when you learn how to read and interpret assembly is that each CPU has a different set of instructions which interact in a different way with one another. Even the mnemonics are different from a CPU architecture to another. For example, the x86 Intel CPU has different instructions compared to the armv7 CPU. While some mnemonics may match, some of them are present on architecture but not in the others. Usually, the reference manuals contain a lot of details about each instruction.

### Mind the compiler
Today's technology is pretty reliable, it works fast and the speed has long become a requirement when we buy a computer. For computer programs to work fast, compilers, those programs that interpret your C, C++, C#, etc. source code and transform it into machine-readable code, usually add and remove pieces of code from the final binary. This is done for optimization purposes. Either to remove useless CPU cycles or to diminish the RAM footprint. The problem is that when we start reversing a binary it is a bit hard to tell what belongs to the actual program logic and what is added for optimization by the compiler. 

A good technique for beginner reverse engineers is to focus more on understanding the flow of the program (by seeking and understanding where the program calls a function, jumps to a different location, updates or checks a variable, etc.) than on the whole thing. It is also a good idea to understand the structure of a procedure in assembly. It would help you understand why you can see a pattern of instructions at the beginning of every function. This is called the function prologue, but about this, we're talking later on.

### CPU Registers

Before starting your journey onto the IA-32 assembly, it's a very good idea to learn more about the architecture itself. The CPU has what is called "registers". They are pretty much a very fast but limited memory on the microprocessor. The microprocessor can access these registers and retrieve the data way faster than it could do from RAM. The problem is, there are only a few of them and some registers are not general purpose, meaning they can't really be used for everything. What can't be fitted in the registers, lies in the RAM.

The IA-32 CPUs have 8 general purpose 32-Bit registers. Of course, these CPUs have way more registers than that, but only eight of them are truly general purpose. These registers are very important and you will find them scattered all over the place in the assembly output of any binary disassembler. A list of the available registers and a brief description is provided below.

EAX, EBX, ECX, and EDX are general purpose registers used for various operations. ECX is sometimes used as a counter by repetitive instructions.

EBP and ESP are the Stack Base Pointer and the Stack Pointer. Together, these two create the Stack Frame.

EDI and ESI are the Destination Index and Source Index registers and is used when dealing with the memory copying.

The preceding "E" in the register name is standing for "extended". That is because the name is carried over from the 16-bit architecture where the registers were, as you may have figured out, 16-bit wide.

Here is a diagram I've made to help you understand the registers and their 16-Bit counterparts.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15067741/41131632-4047f37e-6ac5-11e8-84e2-827c63a231af.png" alt="IA-32 Registers Diagram">
  </p>

### CPU Flags

Aside from the registers, the CPU also has flags which are used during various operations. The flags are contained in the big EFLAGS special register. These flags are used for various purposes and they can manage the processor modes, and states and they can also store the logical state and are heavily used by conditional jump instructions. For example, the JNE instruction which stands for Jump If Not Equal will always use the ZF (Zero Flag) set by a previous CMP (compare) instruction. A CMP instruction takes two operands and subtracts one from the other. If they are equal, the Zero Flag will be set so the following JNE instruction will see that and skip the branch. At the same time, a JE (Jump if Equal) would jump if the flag is set.

### Arithmetics on the IA-32

The IA-32 instruction set contains six instructions for arithmetic purposes. 

ADD  - Used: ADD Operand1, Operand2 - The result is stored in Operand1

SUB  - Used: SUB Operand1, Operant2 - The result is stored in Operand1

DIV  - Used: DIV Operand            - Divides the 64-bit value from EDX:EAX by the unsigned operand specified.

MUL  - Used: MUL Operand            - Multiplies the Unsigned operand specified, by EAX and stores the result as 64-bit in EDX:EAX

IDIV - Used: IDIV Operand           - Divides the 64-bit value from EDX:EAX by the signed operand specified.

IMUL - Used:                        - Multiplies the signed operand specified, by EAX and stores the result as 64-bit in EDX:EAX

### Example

In this example, you can see the CMP, JNE and some general purpose registers used in a block of code that resembles the if conditions in a high-level programming language.

```c
ADD EAX, 12 ; We add 12 to the EAX register's value
CMP EAX, 0xC ; We compare EAX with the hex representation of decimal 12
JNE 0x1001FFee1 ; If the comparison results that EAX = 12, the ZF is set and the JNE won't proceed to the address specified.
MOV EDI, [ECX+0x4b2] ; Move whatever is at ECX + 0x4b2 offset into the EDI register
JMP 0x1001DDe1 ; Unconditional jump to that address.
```

The unconditional jump would not have the chance to be executed if the above JNE executed. Since the comparison on which the JNE instruction relies resulted in the two values being equal, the ZF (Zero Flag) is set and the Jump If Not Zero (JNZ) is skipped. The next instruction after the conditional jump is executed until the JMP which is an unconditional jump. This means that the jump will happen no matter what, as long as the CPU can reach the execution of this instruction.

You can see this sort of comparison followed by a conditional jump in many programs. The closest high-level programming concept that matches this assembly snippet would be an If Condition or other related control flow statements.

For example, the following code contains a simple If - Else statement. Let's see how will this be represented in the assembly after GCC compiler does its job.

```c
#include <stdlib.h>
#include <stdio.h>

int compare(){
  int x = 2;
  int y = 1;
  int z = x + y;
  return z;
}

int main(){
    int x = 0;
    if (x = 12){
      compare();
    } else {
      return 0;
    }
}
```

```c
_compare:
00001f40         push       ebp                                                 ; XREF=0x10ac, _main+30
00001f41         mov        ebp, esp
00001f43         sub        esp, 0xc
00001f46         mov        dword [ss:ebp+var_4], 0x2
00001f4d         mov        dword [ss:ebp+var_8], 0x1
00001f54         mov        eax, dword [ss:ebp+var_4]
00001f57         add        eax, dword [ss:ebp+var_8]
00001f5a         mov        dword [ss:ebp+var_C], eax
00001f5d         mov        eax, dword [ss:ebp+var_C]
00001f60         add        esp, 0xc
00001f63         pop        ebp
00001f64         ret        
; endp
                        
_main:
00001f70         push       ebp                           ; Push the Stack Base Pointer
00001f71         mov        ebp, esp
00001f73         sub        esp, 0x18                     ; Subtract 24 from the Stack Pointer
00001f76         mov        dword [ss:ebp+var_4], 0x0
00001f7d         mov        dword [ss:ebp+var_8], 0x0     ; Clearing purposes?
00001f84         cmp        dword [ss:ebp+var_8], 0xc     ; This is where the comparision is done with 12.
00001f88         jne        0x1f9b                        ; Jump if not equal (pretty much executes the ELSE)

00001f8e         call       _compare                      ; call compare();
00001f93         mov        dword [ss:ebp+var_C], eax
00001f96         jmp        0x1fa2

00001f9b         mov        dword [ss:ebp+var_4], 0x0     ; This is the beginning of the ELSE statement

00001fa2         mov        eax, dword [ss:ebp+var_4]     ; Return 0;
00001fa5         add        esp, 0x18
00001fa8         pop        ebp                           ; Pop the Stack Base Pointer
00001fa9         ret                                      ; Bail out
                        
```

As you can see, only a few of the instructions are relevant for our If - Else statement. The rest are either the compiler's way of pushing the "X" variable to the stack, the function prologue, epilogue, and calls.
In order to understand the program flow, you have to ignore the bits you don't understand and focus on the ones that make sense first.

### Function calls

As you can see, the function calls are done using the CALL instruction which accepts a single operand. This is the address of the function to jump to. Once the CALL instruction is hit, it will push the current Instruction Pointer to the stack (so that it the program can continue from where it left when the called function RETurns), and then it jumps to address of the called function. In the above example, the CALL happens at address `0x00001f8e` and the call instruction calls compare() which is at address `0x00001f40`.

In order to return to the callee, the function ends with a RET instruction. Additionally, one can instruct RET to increment the Stack Pointer (ESP) by a number of bytes after the instruction pointer is popped.

### Using inline assembly in C and C++

Some compilers allow you to write inline assembly code and embed it into your C and C++ code. This is done using the `__asm__` notation or simply using the `asm()`. The IA-32 assembly can be represented in different syntaxes. The Intel syntax is the most used but you can chose the AT&T syntax too if you're into that. Most debuggers and reverse engineering tools, like GDB, allow you to set the disassembly syntax.

Here's a quick example of a C program that also involves assembly:

```c
#include <stdlib.h>
#include <stdio.h>

int source = 3;
int destination = 0;

int main(){
     asm ("mov %1, %0\n\t"
         "add $4, %0"
         : "=r" (destination)
         : "r" (source)
     );

     printf("The result is %d\n", destination);
}

```
I hope you will find this write-up on beginner level IA-32 assembly useful in the future and I wish you good luck in your journey on the land of reverse engineering. Happy CVEing! 

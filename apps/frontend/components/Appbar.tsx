/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/nextjs'

export function Appbar() {
    return <div className="flex justify-between items-center p-4">
            <div>Uptime monitoring</div>
            <div>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            </div>
        </div>
}  

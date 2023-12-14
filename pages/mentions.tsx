import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';

interface User {
    id: string;
    email: string;
    username: string;
    name: string;
}

export default function Mentions() {
    const [userData, setUserData] = useState<any>()
    const [user] = useAuthState(auth);
    const [open, setOpen] = useState(false)
    const [isMac, setIsMac] = useState(false)
    const [allUsers, setAllUsers] = useState<User[]>([])

    const fetchAllUsers = async () => {
        try {
          const res = await fetch('/api/getAllUsers')
          if (!res.ok) {
            throw new Error('Failed to fetch users')
          }
  
          const data: User[] = await res.json()
          setAllUsers(data)
        } catch (err) {
          console.error(err)
        }
      }

    const fetchUser = async () => {
        try {
          if (user) {
            const email = user.email;
            const res = await fetch(`api/getUser?email=${email}`);
    
            if (!res.ok) {
              throw new Error('Failed to fetch user');
            }
    
            const data = await res.json();
            setUserData(data);
          }
        } catch (error) {
          console.error(error);
        }
    };

    const clearMentions = async (username) => {
        await fetch('api/clearNewMentions', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username
            })
        })
    }

    const updateFollowers = async (usernameToAdd: string) => {
        try {
          const res = await fetch('/api/updateFollowers', {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username: userData.username,
              usernameToAdd: usernameToAdd
            })
          })
      
          if (!res.ok) {
            throw new Error('Failed to follow user')
          }
      
          const data = await res.json();
      
          fetchUser()
          return data;
        } catch (err) {
          console.error(err);
        }
    };

    useEffect(() => {
        setIsMac(typeof window !== 'undefined' && window.navigator.userAgent.indexOf('Mac') !== -1);
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              setOpen((open) => !open)
            }
          }
          document.addEventListener("keydown", down as unknown as EventListener)
          return () => document.removeEventListener("keydown", down as unknown as EventListener)
    }, [])

    useEffect(() => {
        fetchAllUsers()
        fetchUser()
    }, [user])

    useEffect(() => {
        if (userData && userData.username) {
          clearMentions(userData.username);
          console.log(userData)
        }
    }, [userData]);


    function timeAgo(date: Date): string {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
          return 'Invalid date';
        }
      
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
        if (isNaN(seconds)) {
          return 'Invalid date';
        }
      
        const intervals = {
          year: Math.floor(seconds / 31536000),
          day: Math.floor(seconds / 86400),
          hour: Math.floor(seconds / 3600),
          minute: Math.floor(seconds / 60),
          second: Math.floor(seconds),
        };
      
        const unitOrder = ['year', 'day', 'hour', 'minute', 'second'];
      
        for (const unit of unitOrder) {
          const value = intervals[unit];
          if (value >= 1) {
            return `${value}${unit.charAt(0)} ago`;
          }
        }
      
        return 'Just now';
    }
      
      

    return (
        <div className='bg-black w-full min-h-screen'>
            <div id='page' className='flex flex-row'>
                <div id='sidebar' className='flex flex-col w-80 min-h-screen border-r border-solid border-neutral-700'>
                    <div id='logo' className='flex flex-row items-center p-5 mt-5 hover:cursor-pointer'>
                        <h1 className='text-white font-sf-pro text-3xl p-3 ml-2'>EchoBox</h1>
                        <img className='invert h-10' src='./whalelogo2.png'></img>
                    </div>
                    <div id='tabs' className='p-5'>
                        <Link href='/feed'>
                            <div id='feed' className='flex flex-row items-center h-20 p-3 rounded-md hover:bg-neutral-950 hover:cursor-pointer'>
                                <img className='invert h-5 m-2' src='./feather/home.svg'></img>
                                <h1 className='font-sf-pro text-white text-l'>For You</h1>
                            </div>
                        </Link>
                        <div id='mentions' className='flex flex-row items-center h-20 p-3 rounded-md hover:bg-neutral-950 hover:cursor-pointer'>
                            <img className='invert h-5 m-2' src='./feather/at-sign.svg'></img>
                            <Link href='/mentions' className='flex font-sf-pro text-white text-l'>Mentions<span className={userData?.newMentions.length > 0 ? 'flex justify-center items-center ml-3 text-xs bg-neutral-700 pr-2.5 pl-2.5 pt-1 pb-1 rounded-full' : 'hidden'}>{userData?.newMentions.length > 0 ? userData?.newMentions.length : ''}</span></Link>
                        </div>
                        <div id='messages' className='flex flex-row items-center h-20 p-3 rounded-md hover:bg-neutral-950 hover:cursor-pointer'>
                            <img className='invert h-5 m-2' src='./feather/send.svg'></img>
                            <Link href='/messages' className='font-sf-pro text-white text-l'>Messages</Link>
                        </div>
                        <Link href='/profile'>
                            <div id='profile' className='flex flex-row items-center h-20 p-3 rounded-md hover:bg-neutral-950 hover:cursor-pointer'>
                                <img className='invert h-5 m-2' src='./feather/user.svg'></img>
                                <h1 className='font-sf-pro text-white text-l'>Profile</h1>
                            </div>
                        </Link>
                    </div>
                </div>
                <div id='feed' className='border-r border-solid border-neutral-700 w-2/4 h-screen overflow-scroll'>
                    <div id='search' className='flex justify-center items-center h-20 border-b border-solid border-neutral-700'>
                        <div className='w-11/12 flex justify-start p-5'>
                            <button className='flex justify-start' onClick={() => setOpen(true)}>
                            <h1 className='text-neutral-500 hover:cursor-caret bg-neutral-800 pt-2 pb-2 pl-3 pr-3 rounded-sm'>Search <span className='pt-1 pb-1 pl-2 pr-2 ml-2 rounded-sm bg-neutral-950'>{isMac ? '⌘ K' : 'Ctrl K'}</span></h1>
                            </button>
                        </div>
                        <CommandDialog open={open} onOpenChange={setOpen}>
                            <CommandInput className='text-white' placeholder="Search Users" />
                            <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup heading="Suggestions">
                                {allUsers.filter((user) => user.username !== userData?.username).map((user) => (
                                    <CommandItem className='flex w-full justify-between' key={user.id}>
                                    <div>
                                        <h1>{user.name}</h1>
                                        <h1 className='font-bold text-xs text-neutral-500'>@{user.username}</h1>
                                    </div>
                                    <button className={`${userData?.following.includes(user.username) ? 'text-blue-300' : 'white'}`} onClick={() => {updateFollowers(user.username)}}>{userData?.following.includes(user.username) ? 'Following' : 'Follow +'}</button>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            </CommandList>
                        </CommandDialog>
                    </div>
                    {userData?.mentions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((mention) => (
                        <div className='flex flex-col items-center'>
                            <div className='flex flex-col justify-center border-b border-neutral-700 w-11/12 p-5 pt-10 pb-10'>
                                <div className='flex flex-row justify-between'>
                                    <div>
                                        <h1 className='text-white'>{mention.name}</h1>
                                        <h1 className='text-gray-500 text-sm font-light'>@{mention.username}</h1>
                                    </div>
                                    <h1 className='text-gray-500 text-sm'>{timeAgo(new Date(mention.createdAt))}</h1>
                                </div>
                                <h1 className='text-white pt-5'>{mention.content.split(new RegExp(/(@\w+)/, 'gi')).map((part, index) => {
                                    if (part.startsWith('@')) {
                                      const usernameToHighlight = part.substring(1); // Remove '@' from the username
                                      const isUsernameInArray = allUsers.some(user => user.username.toLowerCase() === usernameToHighlight.toLowerCase());

                                      return (
                                        <span key={index} className={`bg-${isUsernameInArray ? '[#31338c]' : 'gray-500'} pt-1 pb-1 rounded-sm font-medium text-white`}>
                                          {part}
                                        </span>
                                      );
                                    } else {
                                      return <span key={index}>{part}</span>;
                                    }
                                  })}</h1>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
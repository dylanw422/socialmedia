import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ContextMenu, ContextMenuItem, ContextMenuContent, ContextMenuTrigger } from '../components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

interface Post {
  id: string;
  authorDisplayName: string;
  authorUsername: string;
  authorUrl: string;
  createdAt: string;
  content: string;
  likers: string[];
  reposters: string[];
  repostId: string;
  verifiedAuthor: boolean;
}

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  url: string;
}

export default function Feed() {
  const [content, setContent] = useState<string>('');
  const [userData, setUserData] = useState<any>();
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false)
  const [openMention, setOpenMention] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isMac, setIsMac] = useState(false);
  const textareaRef = useRef(null)

  const handleInsertUsername = (username) => {
    setContent((prevContent) => {
      const caretPosition = textareaRef.current.selectionStart;
  
      // Find the next space or end of string after the caret
      const nextSpaceIndex = prevContent.indexOf(' ', caretPosition);
      const endPosition = nextSpaceIndex !== -1 ? nextSpaceIndex : prevContent.length;
  
      // Find the last @ symbol before the caret
      const lastAtSymbolIndex = prevContent.lastIndexOf('@', caretPosition - 1);
  
      // If there's an @ symbol before the caret
      if (lastAtSymbolIndex !== -1 && lastAtSymbolIndex < caretPosition - 1) {
        const newContent =
          prevContent.substring(0, lastAtSymbolIndex + 1) +
          `${username}` +
          prevContent.substring(endPosition);
  
        const newCaretPosition = lastAtSymbolIndex + username.length + 1; // Add 1 for the space
  
        textareaRef.current.setSelectionRange(newCaretPosition, newCaretPosition);
        setOpenMention(false);
  
        return newContent;
      }
  
      // If no @ symbol is found, insert the username at the caret position
      const newContent =
        prevContent.substring(0, caretPosition) +
        `${username} ` +
        prevContent.substring(endPosition);
  
      const newCaretPosition = caretPosition + username.length + 2; // Add 2 for the '@' symbol and the space
  
      textareaRef.current.setSelectionRange(newCaretPosition, newCaretPosition);
      setOpenMention(false);
  
      return newContent;
    });
  };  

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '@') {
        setOpenMention(true);
      } else if (e.key === ' ' && openMention) {
        setOpenMention(false);
      } else if (e.key === 'Backspace' && content.endsWith('@')) {
        setOpenMention(false);
      }
    };

    const handleKeyUp = () => {
      const mentionRegex = /@\w*$/; // Matches '@' followed by one or more word characters at the end
    
      if (mentionRegex.test(content)) {
        setOpenMention(true);
      }

      if (!mentionRegex.test(content) && !content.includes('@')) {
        setOpenMention(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [content, openMention]);

  useEffect(() => {
    setIsMac(typeof window !== 'undefined' && window.navigator.userAgent.indexOf('Mac') !== -1);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down as unknown as EventListener)
    return () => document.removeEventListener("keydown", down as unknown as EventListener)
  }, [])

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

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/getAllPosts');
      if (!res.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data: Post[] = await res.json();
      setPosts(data.reverse())
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
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

    fetchPosts();
    fetchAllUsers();
    fetchUser();
  }, [user]);

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

  const handleInput = (e) => {
    e.target.style.height = `${e.target.scrollHeight}px`;
    setContent(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleKeyUp = (e) => {
    if (e.target.value === '') {
      e.target.style.height = '2rem';
    }
  };

  const fetchPostsFromApi = async () => {
    try {
      const res = await fetch('/api/getAllPosts');
      if (!res.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data: Post[] = await res.json();
      setPosts(data.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  const post = async (username) => {
    const authorUsername = userData.username;
    await fetch('/api/newPost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authorUsername,
        content,
      }),
    });
    await fetchPostsFromApi();
    setContent('');

    await fetch('/api/mentions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        data: {
          username: userData.username,
          name: userData.name,
          content: content,
          createdAt: new Date()
        }
      })
    })
    await fetchUser()
  };

  const addLike = async (postId: string, username: string) => {
     await fetch('/api/like', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        postId: postId,
        username: username
      })
    })

    fetchPosts()
  }

  const repost = async (username: string, postId: string) => {
    await fetch('/api/repost', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        repostId: postId
      })
    })

    fetchPosts()
  }

  function timeAgo(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

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

  function extractUsername(content) {
    const mentionRegex = /@(\w+)/;
    const match = content.match(mentionRegex);
    return match ? match[1] : null;
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
                        <Link href='/mentions'>
                          <div id='mentions' className='flex flex-row items-center h-20 p-3 rounded-md hover:bg-neutral-950 hover:cursor-pointer'>
                              <img className='invert h-5 m-2' src='./feather/at-sign.svg'></img>
                              <h1 className='flex font-sf-pro text-white text-l'>Mentions<span className={userData?.newMentions.length > 0 ? 'flex justify-center items-center ml-3 text-xs bg-neutral-700 pr-2.5 pl-2.5 pt-1 pb-1 rounded-full' : 'hidden'}>{userData?.newMentions.length > 0 ? userData?.newMentions.length : ''}</span></h1>
                          </div>
                        </Link>
                        <div id='messages' className='flex flex-row items-center h-20 p-3 rounded-md hover:bg-neutral-950 hover:cursor-pointer'>
                            <img className='invert h-5 m-2' src='./feather/send.svg'></img>
                            <h1 className='font-sf-pro text-white text-l'>Messages</h1>
                        </div>
                        <Link href='/profile'>
                          <div id='profile' className='flex flex-row items-center h-20 p-3 rounded-md hover:bg-neutral-950 hover:cursor-pointer'>
                              <img className='invert h-5 m-2' src='./feather/user.svg'></img>
                              <h1 className='font-sf-pro text-white text-l'>Profile</h1>
                          </div>
                        </Link>
                    </div>
                </div>
                <div id='feed' className='border-r border-solid border-neutral-700 w-2/4 h-screen overflow-y-scroll' style={{'scrollbarWidth': 'none'}}>
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
                                  <div className='flex items-center'>
                                    <Avatar>
                                      <AvatarImage src={user.url} />
                                      <AvatarFallback>{user.name.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className='ml-2'>
                                      <ContextMenu>
                                        <ContextMenuTrigger>
                                          <h1>{user.name}</h1>
                                          <h1 className='font-bold text-xs text-neutral-500'>@{user.username}</h1>
                                        </ContextMenuTrigger>
                                        <ContextMenuContent className='bg-neutral-950 border-neutral-700 text-white'>
                                          <ContextMenuItem className='text-xs hover:cursor-pointer text-neutral-200'>
                                            <Link href={`/user/${user.username}`}>
                                              View User Profile
                                            </Link>
                                          </ContextMenuItem>
                                        </ContextMenuContent>
                                      </ContextMenu>
                                    </div>
                                  </div>
                                  <button className={`${userData?.following.includes(user.username) ? 'text-blue-300' : 'white'}`} onClick={() => {updateFollowers(user.username)}}>{userData?.following.includes(user.username) ? 'Following' : 'Follow +'}</button>
                                </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </CommandDialog>
                    </div>
                    <div id='post' className='flex flex-col items-center border-b border-solid border-neutral-700'>
                        <div className='flex items-center w-11/12 justify-between p-5 pt-5 pb-5'>
                            <textarea ref={textareaRef} className='resize-none text-left h-8 pt-1 bg-transparent text-white overflow-hidden w-2/5 outline-none placeholder:text-neutral-500' maxLength={250} minLength={2} onChange={(e) => {setContent(e.target.value)}} value={content} onInput={handleInput} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} placeholder='What will you echo?'></textarea>
                            <button
                              className='bg-white pl-5 pr-5 pt-2 pb-2 rounded-full'
                              onClick={async () => {
                                if (content.length > 0) {
                                  const mentionedUsername = extractUsername(content);
                                  if (mentionedUsername) {
                                    await post(mentionedUsername);
                                    setContent('');
                                  } else {
                                    post('')
                                    setContent('')
                                  }
                                }
                              }}
                            >
                              Post
                            </button>
                        </div>
                        <div className={`flex flex-col w-11/12 pl-5 pr-5 overflow-hidden transition-max-height duration-300 ${openMention ? 'max-h-[180px]' : 'max-h-0'}`}>
                              <h1 className='text-xs font-bold text-neutral-500 pb-2 shadow'>Suggestions</h1>
                              <div className='overflow-scroll'>
                                {allUsers.filter(user => user.username.toLowerCase().startsWith(content.slice(content.indexOf('@') + 1).toLowerCase())).map((user) => (
                                  <div key={user.id}>
                                    <button className='flex justify-start p-3 rounded-sm w-1/5 hover:bg-neutral-950' onClick={() => handleInsertUsername(user.username)}>
                                      <Avatar>
                                        <AvatarImage src={user.url} />
                                        <AvatarFallback>{user.name.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
                                      </Avatar>
                                      <div className='text-white flex flex-col items-start pl-3'>
                                        <h1>{user.name}</h1>
                                        <h1 className='text-xs font-bold text-neutral-500'>@{user.username}</h1>
                                      </div>
                                    </button>
                                  </div>
                                ))}
                              </div>
                        </div>
                    </div>
                    <div className='flex flex-col items-center' id='allPosts'>
                        {posts.filter(post => userData?.following.includes(post.authorUsername) || post.content.includes(`@${userData?.username}`)).map((post) => (
                            <div className={`flex flex-col justify-center border-b border-neutral-700 w-11/12 p-5 pt-3 pb-3 ${post.content.includes(`@${userData?.username}`) ? 'bg-[#140c00] border-l-4 border-l-yellow-400' : ''}`} key={post.id}>
                                <div className='flex justify-between pt-3 pb-3'>
                                    <div className='flex items-center'>
                                        <Avatar>
                                          <AvatarImage src={post.authorUrl}/>
                                          <AvatarFallback className='bg-gradient-to-br from-purple-800 to-fuchsia-600 text-white'>{post.authorDisplayName.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className='pl-3'>
                                          <ContextMenu>
                                            <ContextMenuTrigger>
                                              <h1 className='text-white flex items-center'>{post.authorDisplayName}{post.verifiedAuthor ? <TooltipProvider><Tooltip><TooltipTrigger asChild><img className='w-4 ml-2' src='./verified2.svg'></img></TooltipTrigger><TooltipContent className='bg-neutral-950 text-neutral-300 border-neutral-700'><p>Verified</p></TooltipContent></Tooltip></TooltipProvider> : ''}</h1>
                                              <h1 className='text-gray-500 text-sm font-light'>@{post.authorUsername}</h1>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent className='bg-neutral-950 border-neutral-700 text-white'>
                                              <ContextMenuItem className='text-xs hover:cursor-pointer text-neutral-200'>
                                                <Link href={`/user/${post.authorUsername}`}>
                                                 View User Profile
                                                </Link>
                                              </ContextMenuItem>
                                            </ContextMenuContent>
                                          </ContextMenu>
                                        </div>
                                    </div>
                                    <div className='flex items-center'>
                                        <h1 className='text-gray-500 text-sm'>{timeAgo(new Date(post.createdAt))}</h1>
                                    </div>
                                </div>
                                <div className={post.repostId ? 'text-white pt-3 pb-3 tracking-wide w-4/5 flex justify-center mx-auto' : 'text-white pt-3 pb-3 tracking-wide w-4/5'}>
                                  {post.repostId ? (
                                      // Render the content of the original post if there is a repostId
                                      posts
                                          .filter(originalPost => originalPost.id === post.repostId)
                                          .map((originalPost) =>
                                          <div key={originalPost.id} className={`flex flex-col justify-center border rounded-md border-neutral-700 w-11/12 p-5 ${originalPost.content.includes(`@${userData?.username}`) ? 'bg-[#140c00] border-l-4 border-l-yellow-400' : ''}`}>
                                          <div className='flex justify-between'>
                                              <div className='flex items-center'>
                                                  <Avatar>
                                                      <AvatarImage src={originalPost.authorUrl}/>
                                                      <AvatarFallback className='bg-gradient-to-br from-purple-800 to-fuchsia-600 text-white'>
                                                          {originalPost.authorDisplayName.split(' ').map(word => word[0]).join('').toUpperCase()}
                                                      </AvatarFallback>
                                                  </Avatar>
                                                  <div className='pl-3'>
                                                      <h1 className='text-white'>{originalPost.authorDisplayName}</h1>
                                                      <h1 className='text-gray-500 text-sm font-light'>@{originalPost.authorUsername}</h1>
                                                  </div>
                                              </div>
                                              <div className='flex items-center'>
                                                  <h1 className='text-gray-500 text-sm'>{timeAgo(new Date(originalPost.createdAt))}</h1>
                                              </div>
                                          </div>
                                          <h1 className='pt-3'>
                                              {originalPost.content}
                                          </h1>
                                      </div>
                                    )
                                  ) : (
                                      // Render the content of the current post if there is no repostId
                                      post.content.split(new RegExp(/(@\w+)/, 'gi')).map((part, index) => {
                                          if (part.startsWith('@')) {
                                              const usernameToHighlight = part.substring(1); // Remove '@' from the username
                                              const isUsernameInArray = allUsers.some(
                                                  (user) => user.username.toLowerCase() === usernameToHighlight.toLowerCase()
                                              );
                                              return (
                                                  <span
                                                      key={index}
                                                      className={`bg-${isUsernameInArray ? '[#31338c]' : 'gray-500'} pt-1 pb-1 rounded-sm font-medium text-white`}
                                                  >
                                                      {part}
                                                  </span>
                                              );
                                          } else {
                                              return <span key={index}>{part}</span>;
                                          }
                                      })
                                  )}
                                </div>
                                <div className='flex justify-between pt-3 pb-3 w-32'>
                                    <h1 className='text-sm text-gray-500'>{post.likers.length} Likes</h1>
                                    <h1 className='text-sm text-gray-500'>{post.reposters.length} Echoes</h1>
                                </div>
                                <div className='flex justify-evenly mt-1'>
                                    <h1 className='transition duration-100 ease-in-out text-blue-300 rounded-md pt-2 pb-2 pl-5 pr-5 hover:bg-neutral-900 hover:cursor-pointer' onClick={() => {addLike(post.id, userData.username)}}>Like</h1>
                                    <h1 className='transition duration-100 ease-in-out text-teal-300 rounded-md pt-2 pb-2 pl-5 pr-5 hover:bg-neutral-900 hover:cursor-pointer' onClick={() => {
                                      if (post.repostId) {
                                        repost(userData.username, post.repostId)
                                      } else {
                                        repost(userData.username, post.id)
                                      }
                                      }}>Echo</h1>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
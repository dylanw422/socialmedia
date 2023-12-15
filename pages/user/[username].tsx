// pages/users/[username].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '../../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogTrigger, DialogContent} from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'


interface UserData {
  name: string
  username: string;
  email: string;
  url: string;
  banner: string;
  following: string[];
  followers: string[];
}

interface Post {
  id: string;
  authorDisplayName: string;
  authorUsername: string;
  authorUrl: string
  content: string;
  createdAt: string;
  likers: string[];
  reposters: string;
  repostId: string;
}

interface User {
  name: string;
  username: string;
  following: string[];
  followers: string[]
  url: string
  banner: string
}

const UserProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;
  const [user] = useAuthState(auth)
  const [userData, setUserData] = useState<UserData | null>(null);
  const [thisUser, setThisUser] = useState<User>()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/getUserByUsername/${username}`);
      const data: UserData = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (username) {
      fetchData();
    }
  }, [username]);

  const fetchUsersPosts = async () => {
    try {
      if (userData) {
        const username = userData.username;
        const res = await fetch(`/api/getYourPosts?username=${username}`);

        if (!res.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await res.json();
        setPosts(data.reverse());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsersPosts()
  }, [userData])

  const fetchUser = async () => {
    try {
      if (user) {
        const email = user.email;
        const res = await fetch(`/api/getUser?email=${email}`);

        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }

        const data = await res.json();
        setThisUser(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  useEffect(() => {
    fetchUser()
    fetchAllUsers()
  }, [user])

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

   fetchUsersPosts()
 }

 const updateFollowers = async (usernameToAdd: string) => {
  try {
    const res = await fetch('/api/updateFollowers', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: thisUser.username,
        usernameToAdd: usernameToAdd
      })
    })

    if (!res.ok) {
      throw new Error('Failed to follow user')
    }

    const data = await res.json();

    fetchData()
    fetchUser()
    return data;
  } catch (err) {
    console.error(err);
  }
  
};

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

  fetchUsersPosts()
}

  return (
    <div className='bg-black min-h-screen'>
      <div id='page' className='flex flex-row'>
        <div id='sidebar' className='flex flex-col w-80 min-h-screen border-r border-solid border-neutral-700'>
          <div id='logo' className='flex flex-row items-center p-5 mt-5 hover:cursor-pointer'>
              <h1 className='text-white font-sf-pro text-3xl p-3 ml-2'>EchoBox</h1>
              <img className='invert h-10' src='../whalelogo2.png'></img>
          </div>
          <div id='tabs' className='p-5'>
            <Link href='/feed'>
              <div id='feed' className='flex flex-row items-center h-20 p-3 rounded-md hover:bg-neutral-950 hover:cursor-pointer'>
                  <img className='invert h-5 m-2' src='../feather/home.svg'></img>
                  <h1 className='font-sf-pro text-white text-l'>For You</h1>
              </div>
            </Link>
            <Link href='/mentions'>
              <div id='mentions' className='flex flex-row items-center h-20 p-3 rounded-md hover:bg-neutral-950 hover:cursor-pointer'>
                  <img className='invert h-5 m-2' src='../feather/at-sign.svg'></img>
                  <h1 className='font-sf-pro text-white text-l'>Mentions</h1>
              </div>
            </Link>
            <div id='messages' className='flex flex-row items-center h-20 p-3 rounded-md hover:bg-neutral-950 hover:cursor-pointer'>
                <img className='invert h-5 m-2' src='../feather/send.svg'></img>
                <h1 className='font-sf-pro text-white text-l'>Messages</h1>
            </div>
            <Link href='/profile'>
              <div id='profile' className='flex flex-row items-center h-20 p-3 rounded-md hover:bg-neutral-950 hover:cursor-pointer'>
                  <img className='invert h-5 m-2' src='../feather/user.svg'></img>
                  <h1 className='font-sf-pro text-white text-l'>Profile</h1>
              </div>
            </Link>
          </div>
        </div>
        <div id='feed' className='border-r border-solid border-neutral-700 w-2/4 h-screen overflow-y-scroll'>
        <div id='profile-header' className='relative flex flex-row justify-center items-center border-b border-solid border-neutral-700 h-1/4'>
          <img className='h-full w-full object-cover' src={userData?.banner}></img>
            <div className='absolute flex justify-center items-center h-1/2 aspect-square'>
              <Avatar className='w-full h-full'>
                <AvatarImage src={userData?.url} />
                <AvatarFallback className='bg-gradient-to-br from-purple-800 to-fuchsia-600 text-white text-4xl'>{userData?.name.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
        </div>
        <div id='profile-info' className='flex flex-row justify-between items-center border-b border-solid border-neutral-700 h-32 pl-10 pr-10'>
          <div id='name-username' className='flex flex-col justify-start'>
            <h1 className='flex items-center text-white text-2xl font-sf-pro'>{userData?.name}{userData?.following.includes(thisUser?.username) ? <span className='text-xs text-neutral-300 bg-neutral-900 pt-1 pb-1 pl-2 pr-2 rounded-full ml-2'>Follows You</span> : ''}</h1>
            <h1 className='text-gray-500 font-medium text-sm'>@{userData?.username}</h1>
          </div>
          <div id='followers-following' className='items-center flex flex-row'>
            <div>
              <button className='bg-black text-white border border-neutral-700 text-sm pt-2 pb-2 pl-4 pr-4 m-3 rounded-sm' onClick={() => updateFollowers(userData.username)}>{thisUser?.following.includes(userData?.username) ? 'Unfollow' : 'Follow'}</button>
            </div>
            <Dialog>
              <DialogTrigger className='flex flex-row'>
                <h1 className='text-gray-500 text-sm p-3'>Followers <span className='text-white'>{userData ? userData.followers.length-1 : 0}</span></h1>
                <h1 className='text-gray-500 text-sm p-3'>Following <span className='text-white'>{userData ? userData.following.length-1 : 0}</span></h1>
              </DialogTrigger>
              <DialogContent className='w-full'>
                <Tabs defaultValue='followers' className='mt-7 max-h-[30rem] overflow-scroll'>
                  <TabsList className='flex justify-evenly bg-neutral-900 w-full'>
                    <TabsTrigger value='followers' className='w-full'>Followers</TabsTrigger>
                    <TabsTrigger value='following' className='w-full'>Following</TabsTrigger>
                  </TabsList>
                  <TabsContent value='followers'>
                  {userData?.followers.filter(followerUsername => followerUsername !== userData.username).map((followerUsername) => {
                    const matchedUser = allUsers.find(user => user.username === followerUsername);

                    if (matchedUser) {
                      return (
                        <div className='flex justify-between' key={followerUsername}>
                          <div className='flex justify-between items-center p-3 w-full rounded-sm text-neutral-100 text-left hover:bg-neutral-950'>
                          <div className='flex items-center'>
                          <Avatar>
                            <AvatarImage src={matchedUser?.url}/>
                            <AvatarFallback className='bg-gradient-to-br from-purple-800 to-fuchsia-600 text-white'>{matchedUser.name.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className='pl-3'>
                            <h1 className='text-white'>{matchedUser.name}</h1>
                            <h1 className='text-gray-500 text-sm font-light'>@{matchedUser.username}</h1>
                          </div>
                          </div>
                          </div>
                        </div>
                      );
                    } else {
                      return null;
                    }
                  })}
                  </TabsContent>
                  <TabsContent value='following'>
                  {userData?.following.filter(followerUsername => followerUsername !== userData.username).map((followerUsername) => {
                    const matchedUser = allUsers.find(user => user.username === followerUsername);

                    if (matchedUser) {
                      return (
                        <div className='flex justify-between' key={followerUsername}>
                          <div className='flex justify-between items-center p-3 w-full rounded-sm text-neutral-100 text-left hover:bg-neutral-950'>
                          <div className='flex items-center'>
                          <Avatar>
                            <AvatarImage src={matchedUser?.url}/>
                            <AvatarFallback className='bg-gradient-to-br from-purple-800 to-fuchsia-600 text-white'>{matchedUser.name.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className='pl-3'>
                            <h1 className='text-white'>{matchedUser.name}</h1>
                            <h1 className='text-gray-500 text-sm font-light'>@{matchedUser.username}</h1>
                          </div>
                          </div>
                          </div>
                        </div>
                      );
                    } else {
                      return null; 
                    }
                  })}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
          <div id='posts' className='flex flex-col items-center'>
            {posts.map((post) => (
                <div className='flex flex-col justify-center border-b border-neutral-700 w-11/12 pt-3 pb-3 p-5' key={post.id}>
                    <div className='flex justify-between pt-3 pb-3'>
                      <div className='flex items-center'>
                            <Avatar>
                              <AvatarImage src={post.authorUrl}/>
                              <AvatarFallback className='bg-gradient-to-br from-purple-800 to-fuchsia-600 text-white'>{post.authorDisplayName.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className='pl-3'>
                              <h1 className='text-white'>{post.authorDisplayName}</h1>
                              <h1 className='text-gray-500 text-sm font-light'>@{post.authorUsername}</h1>
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
                        <h1 className='transition duration-100 ease-in-out text-blue-300 rounded-md pt-2 pb-2 pl-5 pr-5 hover:bg-gray-800 hover:cursor-pointer' onClick={() => {addLike(post.id, thisUser.username)}}>Like</h1>
                        <h1 className='transition duration-100 ease-in-out text-teal-300 rounded-md pt-2 pb-2 pl-5 pr-5 hover:bg-neutral-900 hover:cursor-pointer' onClick={() => {
                          if (post.repostId) {
                            repost(thisUser.username, post.repostId)
                          } else {
                            repost(thisUser.username, post.id)
                          }
                          }}>Echo</h1>                    
                    </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

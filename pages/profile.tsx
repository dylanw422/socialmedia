import React, {useState, useEffect} from 'react'
import Link from 'next/link'
import { auth } from '../firebase/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

interface Post {
    id: string;
    authorDisplayName: string;
    authorUsername: string;
    authorUrl: string
    content: string;
    createdAt: string;
    likers: string[];
    reposters: string[];
    repostId: string;
  }
  
  interface User {
    name: string;
    username: string;
    following: [];
    followers: []
    url: string
    banner: string
  }
  
  export default function Profile(): JSX.Element {
    const [posts, setPosts] = useState<Post[]>([]);
    const [userData, setUserData] = useState<User | undefined>();
    const [user] = useAuthState(auth);
    const [displayNameUpdate, setDisplayNameUpdate] = useState('')
    const [usernameUpdate, setUsernameUpdate] = useState('')
    const [newPfp, setNewPfp] = useState()
    const [newPfpUrl, setNewPfpUrl] = useState(userData?.url)
    const [newBanner, setNewBanner] = useState()
    const [newBannerUrl, setNewBannerUrl] = useState(userData?.banner)
    const [allUsers, setAllUsers] = useState<User[]>([])

    const fetchUser = async () => {
      try {
        if (user) {
          const email = user.email;
          const res = await fetch(`/api/getUser?email=${email}`);
  
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
      fetchUser();
      fetchAllUsers();
    }, [user]);

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
      fetchUsersPosts();
      setDisplayNameUpdate(userData?.name)
      setUsernameUpdate(userData?.username)
    }, [userData]);
  
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
    
    const handleDelete = async (id : String) => {
      try {
        const response = await fetch(`/api/deletePost?postId=${id}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Post deleted successfully:', data);
        } else {
          console.error('Failed to delete post:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }

      await fetchUsersPosts()
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
 
     fetchUsersPosts()
   }

    const sendEditProfileRequest = async () => {
      try {
        const res = await fetch('/api/editProfile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: userData?.username,
            newUsername: usernameUpdate,
            newName: displayNameUpdate,
            newUrl: newPfpUrl,
            newBanner: newBannerUrl
          }),
        });
  
        if (res.ok) {
          const data = await res.json();
          console.log('User updated', data);
          fetchUser();
          fetchUsersPosts();
        } else {
          console.error('Error updating user:', res.status, res.statusText);
        }
      } catch (err) {
        console.error('Error updating user:', err);
      }
    };

    const updateProfile = async () => {
      try {
        if (newPfp) {
          const formData = new FormData();
          formData.append('file', newPfp);
          formData.append('upload_preset', 'vzvarlqu');
          formData.append('cloud_name', 'dikuvcyrf');
  
          const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dikuvcyrf/image/upload', {
            method: 'POST',
            body: formData,
          });
  
          if (cloudinaryResponse.ok) {
            const cloudinaryData = await cloudinaryResponse.json();
            const imageUrl = cloudinaryData.secure_url;
            setNewPfpUrl(imageUrl);
          } else {
            console.error('Failed to upload image to Cloudinary:', cloudinaryResponse.status, cloudinaryResponse.statusText);
          }
        }

        if (newBanner) {
          const formData = new FormData();
          formData.append('file', newBanner);
          formData.append('upload_preset', 'vzvarlqu');
          formData.append('cloud_name', 'dikuvcyrf');
  
          const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dikuvcyrf/image/upload', {
            method: 'POST',
            body: formData,
          });
  
          if (cloudinaryResponse.ok) {
            const cloudinaryData = await cloudinaryResponse.json();
            const imageUrl = cloudinaryData.secure_url;
            setNewBannerUrl(imageUrl);
          } else {
            console.error('Failed to upload image to Cloudinary:', cloudinaryResponse.status, cloudinaryResponse.statusText);
          }
        }
        await sendEditProfileRequest();
      } catch (error) {
        console.error('Error during image upload to Cloudinary:', error);
      }
    };

    const handleProfilePic = (e) => {
      const selectedFile = e.target.files[0]
      if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
        setNewPfp(selectedFile);
      } else {
        console.error('Selected file exceeds the maximum size limit (10MB). Please choose a smaller file.');
      }
    }

    const handleBanner = (e) => {
      const selectedFile = e.target.files[0]
      if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
        setNewBanner(selectedFile)
      } else {
        console.error('Selected Banner exceeds the maximum size limit (10MB). Please choose a smaller file.')
      }
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

    useEffect(() => {
      if (newPfpUrl !== userData?.url || newBannerUrl !== userData?.banner) {
        sendEditProfileRequest();
      }
    }, [newPfpUrl, newBannerUrl]);

    return (
        <div className='bg-black min-h-screen'>
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
                              <h1 className='font-sf-pro text-white text-l'>Mentions</h1>
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
                            <h1 className='text-white text-2xl font-sf-pro'>{userData?.name}</h1>
                            <div className='flex'>
                                <h1 className='text-gray-500 font-medium text-sm'>@{userData?.username}</h1>
                                <Dialog>
                                  <DialogTrigger>
                                    <img className='invert w-3 ml-2 hover:cursor-pointer' src='/feather/edit.svg'></img>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px] border border-neutral-700 rounded-lg">
                                    <DialogHeader>
                                      <DialogTitle>Edit Profile</DialogTitle>
                                      <DialogDescription>
                                        Make changes to your profile here.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <label htmlFor="username" className="text-right">
                                          Name
                                        </label>
                                        <input
                                          id="displayName"
                                          defaultValue={userData?.name}
                                          className="col-span-3 rounded-sm bg-black text-white border border-neutral-700 p-2 outline-none"
                                          maxLength={20}
                                          onInput={(e) => setDisplayNameUpdate((e.target as HTMLInputElement).value)}
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <label htmlFor="username" className="text-right">
                                          Username
                                        </label>
                                        <input
                                          id="username"
                                          defaultValue={userData?.username}
                                          className="col-span-3 rounded-sm bg-black text-white border border-neutral-700 p-2 outline-none"
                                          maxLength={16}
                                          onInput={(e) => setUsernameUpdate((e.target as HTMLInputElement).value)}
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <label htmlFor="profilePicture" className="text-right">
                                          Picture
                                        </label>
                                        <input
                                          id="profilePicture"
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleProfilePic(e)}
                                          className="col-span-3 rounded-sm bg-black text-white border border-neutral-700 p-2 outline-none"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <label htmlFor="banner" className="text-right">
                                          Banner
                                        </label>
                                        <input
                                          id="banner"
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleBanner(e)}
                                          className="col-span-3 rounded-sm bg-black text-white border border-neutral-700 p-2 outline-none"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <button className='bg-white text-black pt-2 pb-2 pl-4 pr-4 rounded-md' type="submit" onClick={() => {updateProfile()}}>Save changes</button>
                                      </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        <div id='followers-following'>
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
                                        <button className='text-sm bg-neutral-900 pt-2 pb-2 pl-4 pr-4 rounded-md mr-3' onClick={() => updateFollowers(followerUsername)}>
                                          {userData.following.includes(followerUsername) ? 'Following' : 'Follow Back'}
                                        </button>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    return null; // Handle the case when a follower is not found in allUsers
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
                                        <button className='text-sm bg-neutral-900 pt-2 pb-2 pl-4 pr-4 rounded-md mr-3' onClick={() => updateFollowers(followerUsername)}>
                                          Unfollow
                                        </button>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    return null; // Handle the case when a follower is not found in allUsers
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
                                        <Popover>
                                          <PopoverTrigger>
                                            <img className='invert w-5 ml-3' src='./feather/more-horizontal.svg'></img>
                                          </PopoverTrigger>
                                          <PopoverContent>
                                            <button className='w-full text-red-600' onClick={() => {handleDelete(post.id)}}>Delete</button>
                                          </PopoverContent>
                                        </Popover>
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
                                    <h1 className='transition duration-100 ease-in-out text-blue-300 rounded-md pt-2 pb-2 pl-5 pr-5 hover:bg-gray-800 hover:cursor-pointer' onClick={() => {addLike(post.id, userData.username)}}>Like</h1>
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
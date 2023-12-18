import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { auth, GoogleAuthProvider, signInWithPopup, signOut } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const { user } = result;
      const { email, displayName } = user;
      const username = email.split('@')[0];
      if (!email || !displayName || !username) {
        console.log('Missing required fields in the request body');
        return;
      }
      await fetch('/api/newuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          displayName,
          username,
        }),
      });
      router.push('/feed');
    } catch (error) {
      console.error(error);
    }
  };

  const signMeOut = () => {
    signOut(auth);
  };

  useEffect(() => {
    if (user) {
      //router.push('/feed');
    }
  }, [user, router]);

  return (
    <div className="bg-black min-h-screen">
      <div className="flex flex-col justify-between items-center w-full h-screen">
        <div className="flex justify-between items-center w-full h-20 mr-20">
          <div className="flex items-center justify-center p-4 ml-10">
            <h1 className="text-white font-bold text-3xl font-sf-pro">EchoBox</h1>
            <img className="pl-2 m-0 h-10 invert" src="./whalelogo2.png" alt="Logo"></img>
          </div>
          <div>
            <button
              className="p-2 pl-4 pr-4 text-black font-bold font-sf-pro bg-gray-100 rounded-md"
              onClick={user ? signMeOut : signInWithGoogle}
            >
              {user ? 'Sign Out' : 'Log In'}
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-white text-7xl drop-shadow-3xl font-montserrat">where voices resonate</h2>
        </div>
        <div className="h-20"></div>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import Sidebar from "./components/common/SideBar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"
import {Toaster} from "react-hot-toast"
import { baseUrl } from "./constant/url";
import LoadingSpinner from "./components/common/LoadingSpinner";


function App() {

const {data :authUser,isLoading}=useQuery({
  queryKey:["authUser"],
  queryFn:async()=>{
    try {
      const res=await fetch(`${baseUrl}/api/auth/me`,{
        method:"GET",
        credentials:"include",
        headers:{
          "Content-Type":"application/json"
        }
      })
      const data=await res.json();
      if(data.error){
        return null
      }
      if(!res.ok){
        throw new Error(data.error || "Something went Wrong ")
      }
         return data;
    } catch (error) {
      throw (error);
    }
  },
  retry:false
})



if(isLoading){
  return(
    <div className="flex justify-center item-center h-screen">
<LoadingSpinner size="lg"/>
    </div>
  )
}

  return (
    <div className='flex max-w-6xl mx-auto'>
     { authUser && <Sidebar/>}
    <Routes>
      <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login'/>} />
      <Route path='/login' element={!authUser ?<LoginPage />: <Navigate to="/"/>} />
      <Route path='/signup' element={!authUser ? <SignUpPage />:<Navigate to='/'/>} />
      <Route path='/notification' element={authUser ?<NotificationPage /> : <Navigate to="/login"/>}/>
      <Route path='/profile/:username' element={authUser ? <ProfilePage /> :<Navigate to="/login"/>}/>
    </Routes>
    {authUser && <RightPanel/>}
    <Toaster/>
  </div>
  );
}

export default App;
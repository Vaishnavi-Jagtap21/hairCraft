import React, { useEffect, useState } from 'react'
import Chatpage from './Chatpage'


const ChatCircle = () => {

  const [isChatPage, setIsChatPage] = useState(false);
  
  const handelOpen =()=>{
    setIsChatPage(true)
  }

  return (
    <>
      <div className='h-[55px] w-[55px] rounded-full bg-black fixed bottom-[8%] right-[1%] flex items-center justify-center cursor-pointer' onClick={()=>{handelOpen()}}>
        <i className="ri-chat-ai-line text-white text-xl"></i>
      </div>
      {isChatPage && <Chatpage setIsChatPage={setIsChatPage}/>}
    </>
  )
}

export default ChatCircle
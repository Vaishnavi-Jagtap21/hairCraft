import React from 'react'
import { toast } from 'sonner';

const Message = ({chat}) => {

  const handelCopy = ()=>{
    navigator.clipboard.writeText(JSON.stringify(chat.ai));
    toast.success("copied to clipboard")
  }

 return (
    <div className='flex flex-col gap-10'>
        <div className='w-full min-h-[30px] '>
             <span className='float-end text-right bg-gray-500 text-white text-md py-2 px-4 rounded-3xl'>{chat.user}</span>
        </div>

        <div className='w-full min-h-[30px]'>
             <div className=' text-left bg-gray-800 text-white text-md py-2 px-4 rounded-3xl'>{chat.ai}</div>
             <br></br>
             <span className='inline-block mt-1 ml-3 text-md'>
                <i className="ri-thumb-up-line cursor-pointer"></i>
                <i className="ri-file-copy-line ml-4 cursor-pointer" onClick={()=>handelCopy(chat.ai)}></i>
            </span>
        </div>
    </div>
  )
}

export default Message
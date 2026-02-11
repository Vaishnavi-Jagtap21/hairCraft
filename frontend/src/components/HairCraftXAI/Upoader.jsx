import React, { useState } from 'react'
import { support } from '../../../config/BRAND'
import uploadtoCloud from '../../../config/uploadToCloud'
import { toast } from 'sonner'
import AnimateText from './AnimateText'

const Upoader = ({ file = null, setFile = null, id = '0' }) => {

    const [uploadedImageUrl, setUploadedImageUrl] = useState(null)

    const handelFileChange = async (e) => {
        try {
            setFile(e.target.files[0])
            setUploadedImageUrl("loading...")
             let url = await uploadtoCloud(e.target.files[0])
            if (!url) {
                toast.error('something went wrong')
                setUploadedImageUrl(null)
            } else {
                setUploadedImageUrl(url)
                toast.success('image uploaded successfully')
            }
        } catch (error) {
            toast.error(error.message || "something went wrong")
        }
    }


    return (
        <div className='h-full w-full text-center relative'>
            <div className='h-[50px] w-[50px] bg-gray-200 absolute rounded-2xl m-2 overflow-hidden'>
                {
                    file && <img src={URL.createObjectURL(file)} className='h-full w-full object-cover' />
                }
            </div>
            {
                uploadedImageUrl == null ? <label htmlFor={id} className='cursor-pointer w-[98%]  h-[98%] border-dotted border-2 rounded-xl flex items-center justify-center text-xl flex-col'>
                    <i className="ri-upload-cloud-fill text-2xl"></i>
                    <span className='text-base text-pink-500 mt-4'> support ~ {support}</span>
                    <p className='text-sm text-gray-400'>{support} on work...</p>
                    
                </label>  : uploadedImageUrl == "loading..." ? 
                 <div className='h-[98%] w-[98%] text-center flex items-center justify-center border-[1px] rounded-xl'>
                    <AnimateText text='uploading..'/>
                 </div> : 

                 <div className='h-[98%] w-[98%] text-center flex items-center justify-center border-[1px] rounded-xl overflow-hidden'>
                    <img src={uploadedImageUrl} className='h-full w-full object-cover'/>
                 </div>
            }
            <input type='file' className='hidden' id={id} accept='image/*' onChange={(e) => handelFileChange(e)} />
        </div>
    )
}

export default Upoader
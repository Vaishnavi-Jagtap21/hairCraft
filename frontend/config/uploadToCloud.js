import ImageKit from "imagekit-javascript";

const uploadtoCloud = async (file) => {

  const imagekit = new ImageKit({
    publicKey: import.meta.env.VITE_IMGKIT_PUBLIC_KEY,
    urlEndpoint: import.meta.env.VITE_IMGKIT_URL_ENDPOINT,
    authenticationEndpoint: "http://localhost:8080/imagekit/auth"
  });

  const result = await imagekit.upload({
    file,
    fileName: file.name
  });

  return result.url;
};

export default uploadtoCloud;

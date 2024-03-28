import axios from "axios";

export const CommonService = {
  async convertImageUrlToFile(imageUrl: any) {
    try {
      // Fetch the image data using Axios
      const response = await axios.get(imageUrl, { responseType: 'blob' });

      // Extract file name from the URL or use a default name
      const fileName = imageUrl.split('/').pop() || 'file.docx';

      // Create a File object
      return new File([response.data], fileName, {type: response.headers['content-type']});

    } catch (error) {
      console.error('Error converting image URL to file:', error);
      throw error;
    }
  }
};

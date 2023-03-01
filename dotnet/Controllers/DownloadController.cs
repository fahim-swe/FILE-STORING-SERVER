using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Helper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DownloadController : ControllerBase
    {
        private readonly IFileProvider _fileProvider;   
        public DownloadController(IFileProvider fileProvider)
        {
            _fileProvider = fileProvider;
        } 

        [HttpGet]
        public async Task<IActionResult> DownloadFile(string fileName)
        {
            if (string.IsNullOrEmpty(fileName) || fileName == null)
            {
                return Content("File Name is Empty...");              
            }

            // get the filePath

            var filePath = Path.Combine(Directory.GetCurrentDirectory(),
                "../resources", fileName);

            // create a memorystream
            var memoryStream = new MemoryStream();

            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memoryStream);            
            }
            // set the position to return the file from
            memoryStream.Position = 0;

            // Get the MIMEType for the File
            var mimeType = (string file) =>
            {
                var mimeTypes = MimeTypes.GetMimeTypes();
                var extension = Path.GetExtension(file).ToLowerInvariant();
                return mimeTypes[extension];
            };

            return File(memoryStream, mimeType(filePath), Path.GetFileName(filePath));
        }
    }
}
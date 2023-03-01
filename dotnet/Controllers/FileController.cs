using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dto;
using backend.Helper;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class FileController : ControllerBase
    {
        private readonly IBufferedFileUploadService _bufferedFileUploadService; 
        public FileController(IBufferedFileUploadService bufferedFileUploadService)
        {
            _bufferedFileUploadService = bufferedFileUploadService;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetListOfFiles()
        {
            var files = ProcessDirectory.ListOfFilesInTargetDirectory("/home/dsi/Documents/Task/resources");
            return Ok(files);
        }



        [HttpPost]
        public async Task<IActionResult> AddFileToServer([FromForm] UploadFileDto fileDto)
        {
            return await _bufferedFileUploadService.UploadFile(fileDto.file, fileDto.fileName) ? Created("Ok", fileDto.fileName) : BadRequest("Error");
        }
    }
}
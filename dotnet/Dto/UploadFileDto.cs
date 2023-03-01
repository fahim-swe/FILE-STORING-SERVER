using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dto
{
    public class UploadFileDto
    {
        public IFormFile file {get; set;} = null!;
        public string fileName  {get;set;} = null!;
    }
}
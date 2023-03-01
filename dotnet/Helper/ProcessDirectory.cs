using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Helper
{
    public static class ProcessDirectory
    {
        public static List<string> ListOfFilesInTargetDirectory(string targetDirectory)
        {
            var fileName = new List<string>();

            string[] fileEntries = Directory.GetFiles(targetDirectory);
            foreach(var _fileName in fileEntries)
            {
                fileName.Add(Path.GetFileName(_fileName));
            }

            return fileName;
        }
    }
}
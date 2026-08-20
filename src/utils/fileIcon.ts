import audioIcon from "@/icons/audio.png";
import codeIcon from "@/icons/code.png";
import csvIcon from "@/icons/csv.png";
import defaultIcon from "@/icons/default.png";
import docIcon from "@/icons/doc.png";
import emailIcon from "@/icons/email.png";
import excelIcon from "@/icons/excel.png";
import htmlIcon from "@/icons/html.png";
import imageIcon from "@/icons/image.png";
import pdfIcon from "@/icons/pdf.png";
import pptIcon from "@/icons/ppt.png";
import sqlIcon from "@/icons/sql.png";
import txtIcon from "@/icons/txt.png";
import videoIcon from "@/icons/video.png";
import zipIcon from "@/icons/zip.png";

export function getFileIcon(fileName: string = "") {
  const name = fileName.toLowerCase().trim();

  if (/\.(pdf)$/.test(name)) return pdfIcon;
  if (/\.(doc|docx|dot|dotx|wps|rtf)$/.test(name)) return docIcon;
  if (/\.(xls|xlsx|xlsm|xlsb)$/.test(name)) return excelIcon;
  if (/\.(csv|tsv)$/.test(name)) return csvIcon;
  if (/\.(ppt|pptx|pps|ppsx|odp|dps)$/.test(name)) return pptIcon;

  if (/\.(txt|log|md|markdown|rst|tex|ini|conf|cfg|properties)$/.test(name)) {
    return txtIcon;
  }

  if (/\.(html|htm|xhtml)$/.test(name)) return htmlIcon;

  if (
    /\.(java|kt|kts|scala|groovy|gradle|class|js|jsx|ts|tsx|mjs|cjs|vue|c|h|cc|cpp|cxx|hpp|cs|py|pyc|pyw|go|rs|swift|dart|lua|r|rb|php|pl|sh|bash|zsh|fish)$/.test(
      name,
    )
  ) {
    return codeIcon;
  }

  if (/\.(sql|db|sqlite|sqlite3|dump)$/.test(name)) return sqlIcon;

  if (
    /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|tif|tiff|heic|heif|avif)$/.test(name)
  ) {
    return imageIcon;
  }

  if (/\.(mp3|wav|flac|aac|ogg|oga|m4a|wma|ape|amr)$/.test(name)) {
    return audioIcon;
  }

  if (/\.(mp4|m4v|mov|avi|mkv|flv|wmv|webm|mpeg|mpg|3gp|ts)$/.test(name)) {
    return videoIcon;
  }

  if (/\.(eml|msg|pst|ost)$/.test(name)) return emailIcon;

  if (/\.(zip|rar|7z|tar|gz|bz2|xz|tgz|jar|war|ear)$/.test(name)) {
    return zipIcon;
  }

  return defaultIcon;
}

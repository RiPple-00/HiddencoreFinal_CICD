package hiddencore.ddasum.backend.service.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import hiddencore.ddasum.backend.config.GalleryDemoProperties;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LocalFileStorageService {

    private final GalleryDemoProperties galleryDemoProperties;

    public record StoredFile(Path absolutePath, String publicUrl) {}

    public StoredFile storeGalleryImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일이 필요합니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일만 업로드할 수 있습니다.");
        }

        String ext = extensionFromContentType(contentType);
        String filename = UUID.randomUUID() + ext;
        Path dir = Paths.get(galleryDemoProperties.getUploadDir(), "gallery").toAbsolutePath().normalize();

        try {
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            file.transferTo(target);
            String publicUrl = "/uploads/gallery/" + filename;
            return new StoredFile(target, publicUrl);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다.");
        }
    }

    public void deleteIfExists(Path path) {
        if (path == null) {
            return;
        }
        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "임시 파일 삭제에 실패했습니다.");
        }
    }

    private static String extensionFromContentType(String contentType) {
        String lower = contentType.toLowerCase(Locale.ROOT);
        if (lower.contains("png")) {
            return ".png";
        }
        if (lower.contains("webp")) {
            return ".webp";
        }
        return ".jpg";
    }
}

package hiddencore.ddasum.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import hiddencore.ddasum.backend.config.GalleryDemoProperties;
import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentStatus;
import hiddencore.ddasum.backend.domain.Document.DocumentType;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.Post;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.DocumentRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.repository.PostRepository;
import hiddencore.ddasum.backend.repository.UsersRepository;
import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.service.ai.AiActionClient;
import hiddencore.ddasum.backend.service.ai.AiActionClient.AiActionResult;
import hiddencore.ddasum.backend.service.ai.LocalPythonActionClassifier;
import hiddencore.ddasum.backend.service.ai.LocalPythonFaceVerifier;
import hiddencore.ddasum.backend.service.ai.LocalPythonFaceVerifier.FaceVerifyResult;
import hiddencore.ddasum.backend.service.storage.LocalFileStorageService;
import hiddencore.ddasum.backend.service.storage.LocalFileStorageService.StoredFile;
import hiddencore.ddasum.backend.web.dto.guardian.activephoto.ActivityGalleryListResponse;
import hiddencore.ddasum.backend.web.dto.guardian.activephoto.ActivityGalleryUploadResponse;
import hiddencore.ddasum.backend.web.dto.guardian.activephoto.GalleryModalDto;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ActivityGalleryService {

    public static final int GALLERY_PAGE_SIZE = 6;

    private static final Map<String, String> ACTION_TITLES =
            Map.of(
                    "drawing", "그림 그리기",
                    "folding", "종이접기",
                    "dancing", "춤추기");

    private static final Map<String, String> ACTION_CONTENTS =
            Map.of(
                    "drawing",
                    "그림 그리기 활동에 참여하셨습니다. 색과 붓을 활용해 표현력과 정서적 안정에 도움이 되는 시간을 보내셨어요.",
                    "folding",
                    "종이접기 활동에 참여하셨습니다. 손을 사용한 만들기로 소근육 발달과 집중력 향상에 도움이 되었어요.",
                    "dancing",
                    "춤추기 활동에 참여하셨습니다. 음악에 맞춘 신체 움직임으로 활력을 되찾고 즐거운 시간을 보내셨어요.");

    private final GalleryDemoProperties galleryDemoProperties;
    private final LocalFileStorageService fileStorageService;
    private final AiActionClient aiActionClient;
    private final LocalPythonActionClassifier localPythonActionClassifier;
    private final LocalPythonFaceVerifier localPythonFaceVerifier;
    private final PatientRepository patientRepository;
    private final PostRepository postRepository;
    private final DocumentRepository documentRepository;
    private final UsersRepository usersRepository;
    private final CareChecklistService careChecklistService;

    @Transactional
    public ActivityGalleryUploadResponse uploadForCaregiver(AuthenticatedUser caregiver, MultipartFile file) {
        requireCaregiverWithFacility(caregiver);

        Patient patient = resolveDemoPatient(caregiver.facilityId());
        Users requester =
                usersRepository
                        .findById(caregiver.userId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        StoredFile stored = fileStorageService.storeGalleryImage(file);
        String imagePath = stored.absolutePath().toString();
        LocalDateTime takenAt = LocalDateTime.now();

        // 모든 업로드에 얼굴 인식 AI 실행 (전체 환자 대상, 시연 시 patient_6 필터)
        FaceVerifyResult faceVerify =
                localPythonFaceVerifier
                        .verify(imagePath, GalleryDemoProperties.AI_PATIENT_KEY)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.SERVICE_UNAVAILABLE,
                                                "얼굴 인식 AI를 실행할 수 없습니다. "
                                                        + "ai/dasum-face-ai-test 에 insightface가 설치되어 있는지 확인해 주세요."));

        // 모든 업로드에 활동 분류 AI 실행
        List<Post> programs = postRepository.findActiveApplyProgramsWithSchedule(caregiver.facilityId());
        Optional<AiActionResult> ai = aiActionClient.classify(imagePath, takenAt, programs);
        if (ai.isEmpty()) {
            ai = localPythonActionClassifier.classify(imagePath);
        }

        // 시연: 기만경(patient_6) 포함 사진만 보호자 갤러리에 저장
        if (!faceVerify.accepted()) {
            fileStorageService.deleteIfExists(stored.absolutePath());
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, buildRejectMessage(faceVerify, ai));
        }

        String title;
        String content;
        Post linkedPost = null;

        if (ai.isPresent()) {
            title = resolveActionTitle(ai.get());
            content = resolveActionContent(ai.get());
            if (ai.get().matchedProgram() != null && ai.get().matchedProgram().postId() != null) {
                linkedPost =
                        postRepository
                                .findById(ai.get().matchedProgram().postId())
                                .filter(p -> p.getFacilityId().getFacilityId().equals(caregiver.facilityId()))
                                .orElse(null);
            }
        } else {
            title = "프로그램 활동";
            content = "오늘 프로그램 활동 사진이 등록되었습니다.";
        }

        Document document =
                Document.builder()
                        .patientId(patient)
                        .facilityId(patient.getFacilityId())
                        .postId(linkedPost)
                        .type(DocumentType.GALLERYCARD)
                        .title(title)
                        .content(content)
                        .requesterUserId(requester)
                        .status(DocumentStatus.ISSUED)
                        .fileUrls(stored.publicUrl())
                        .issuedAt(takenAt)
                        .build();

        Document saved = documentRepository.save(document);
        GalleryModalDto card = GalleryModalDto.from(saved);

        String message = buildSuccessMessage(faceVerify, patient.getName(), countFilledSlots(patient.getPatientId()));

        return ActivityGalleryUploadResponse.builder()
                .documentId(saved.getDocumentId())
                .patientId(patient.getPatientId())
                .aiPatientKey(GalleryDemoProperties.AI_PATIENT_KEY)
                .patientName(patient.getName())
                .detectedPatients(faceVerify.detectedPatients())
                .detectedPatientNames(faceVerify.detectedPatientNames())
                .card(card)
                .action(ai.map(AiActionResult::action).orElse(null))
                .actionKo(ai.map(AiActionResult::actionKo).orElse(null))
                .confidence(ai.map(AiActionResult::confidence).orElse(null))
                .message(message)
                .build();
    }

    @Transactional(readOnly = true)
    public ActivityGalleryListResponse listForGuardian(Long guardianUserId, Long patientId) {
        if (!careChecklistService.isGuardianOfPatient(guardianUserId, patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "연결된 환자만 조회할 수 있습니다.");
        }

        List<Document> galleryDocuments = resolveAllGalleryDocuments(patientId);
        List<GalleryModalDto> slots = buildPhotoList(galleryDocuments);
        int filledCount = galleryDocuments.size();

        List<Document> all =
                documentRepository.findByPatientId_PatientIdAndTypeOrderByCreatedAtDesc(
                        patientId, DocumentType.GALLERYCARD);

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);

        List<GalleryModalDto> todayCards = new ArrayList<>();
        List<GalleryModalDto> weekCards = new ArrayList<>();

        for (Document doc : all) {
            GalleryModalDto dto = GalleryModalDto.from(doc);
            LocalDate created = doc.getCreatedAt() != null ? doc.getCreatedAt().toLocalDate() : null;
            if (created == null) {
                continue;
            }
            if (created.equals(today)) {
                todayCards.add(dto);
            }
            if (!created.isBefore(weekStart) && !created.isAfter(today)) {
                weekCards.add(dto);
            }
        }

        GalleryModalDto hero = filledCount == 0 ? null : slots.get(slots.size() - 1);

        return ActivityGalleryListResponse.builder()
                .slotCapacity(GALLERY_PAGE_SIZE)
                .filledCount(filledCount)
                .slots(slots)
                .hero(hero)
                .today(todayCards)
                .week(weekCards)
                .build();
    }

    private static List<GalleryModalDto> buildPhotoList(List<Document> documents) {
        List<GalleryModalDto> photos = new ArrayList<>(documents.size());
        for (Document document : documents) {
            photos.add(GalleryModalDto.from(document));
        }
        return photos;
    }

    private int countFilledSlots(Long patientId) {
        return resolveAllGalleryDocuments(patientId).size();
    }

    private List<Document> resolveAllGalleryDocuments(Long patientId) {
        return documentRepository.findByPatientId_PatientIdAndTypeOrderByCreatedAtAsc(
                patientId, DocumentType.GALLERYCARD);
    }

    private static String buildSuccessMessage(
            FaceVerifyResult faceVerify, String guardianPatientName, int slotNumber) {
        String base =
                faceVerify.message().isBlank()
                        ? guardianPatientName + " 님 보호자 사진 기록 " + slotNumber + "번째 칸에 등록했습니다."
                        : faceVerify.message();
        return base + " (" + guardianPatientName + " 갤러리 " + slotNumber + "번째 칸)";
    }

    private static String buildRejectMessage(
            FaceVerifyResult faceVerify, Optional<AiActionResult> ai) {
        String base =
                faceVerify.message().isBlank()
                        ? "기만경이 포함된 사진만 보호자 사진 기록에 등록됩니다."
                        : faceVerify.message();
        if (ai.isEmpty()) {
            return base;
        }
        String actionKo = ai.get().actionKo();
        if (actionKo == null || actionKo.isBlank()) {
            return base;
        }
        return base + " (활동 AI 인식: " + actionKo + ")";
    }

    private static String resolveActionTitle(AiActionResult ai) {
        String key = normalizeActionKey(ai.action(), ai.actionKo());
        if (key != null && ACTION_TITLES.containsKey(key)) {
            return ACTION_TITLES.get(key);
        }
        return "프로그램 활동";
    }

    private static String resolveActionContent(AiActionResult ai) {
        String key = normalizeActionKey(ai.action(), ai.actionKo());
        if (key != null && ACTION_CONTENTS.containsKey(key)) {
            return ACTION_CONTENTS.get(key);
        }
        return "오늘 프로그램 활동 사진이 등록되었습니다.";
    }

    private static String normalizeActionKey(String action, String actionKo) {
        if (action != null && !action.isBlank()) {
            String normalized = action.toLowerCase(Locale.ROOT).trim();
            if (ACTION_TITLES.containsKey(normalized)) {
                return normalized;
            }
        }
        if (actionKo == null || actionKo.isBlank()) {
            return null;
        }
        String ko = actionKo.replace(" ", "").trim();
        if (ko.contains("그림") || ko.contains("미술") || ko.contains("드로잉")) {
            return "drawing";
        }
        if (ko.contains("종이") || ko.contains("접기") || ko.contains("오리가미")) {
            return "folding";
        }
        if (ko.contains("춤") || ko.contains("댄스") || ko.contains("무용")) {
            return "dancing";
        }
        return null;
    }

    private Patient resolveDemoPatient(Long facilityId) {
        Long demoId = galleryDemoProperties.getDemoPatientId();
        Patient patient =
                patientRepository
                        .findById(demoId)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "시연 환자(patient_6 → 기만경)를 찾을 수 없습니다. patient_id="
                                                        + demoId));

        if (!patient.getFacilityId().getFacilityId().equals(facilityId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "시연 환자가 요양사 시설과 일치하지 않습니다.");
        }
        return patient;
    }

    private static void requireCaregiverWithFacility(AuthenticatedUser u) {
        if (!"CAREGIVER".equals(u.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "요양사 전용 기능입니다.");
        }
        if (u.facilityId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "시설 정보가 없는 계정입니다.");
        }
    }
}

package hiddencore.ddasum.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hiddencore.ddasum.backend.domain.PatientNote;
import hiddencore.ddasum.backend.domain.PatientNote.NoteType;

public interface PatientNoteRepository extends JpaRepository<PatientNote, Long> {

    Optional<PatientNote> findFirstByPatientId_PatientIdAndTypeAndTitleOrderByUpdatedAtDesc(
            Long patientId, NoteType type, String title);
}

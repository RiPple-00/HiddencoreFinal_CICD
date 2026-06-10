package hiddencore.ddasum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

import hiddencore.ddasum.backend.config.GalleryDemoProperties;
import hiddencore.ddasum.backend.config.TranslationProperties;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({GalleryDemoProperties.class, TranslationProperties.class})
@OpenAPIDefinition(
		info = @Info(
				title = "Ddasum API",
				version = "v1",
				description = "Ddasum backend API 문서"
		)
)

public class DdasumApplication {

	public static void main(String[] args) {
		SpringApplication.run(DdasumApplication.class, args);
	}
}

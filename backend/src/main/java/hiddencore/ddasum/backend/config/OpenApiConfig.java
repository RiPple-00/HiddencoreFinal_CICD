package hiddencore.ddasum.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ddasumOpenApi() {
        return new OpenAPI()
                .openapi("3.0.3")
                .info(new Info()
                        .title("Ddasum API")
                        .version("v1")
                        .description("따숨 요양병원 백엔드 REST API 문서"))
                .addServersItem(new Server().url("/").description("현재 서버"));
    }

    /**
     * springdoc 기본 생성이 openapi 3.1 일 때 UI/검증 도구와 충돌하는 경우가 있어 3.0.x 로 맞춤.
     */
    @Bean
    public OpenApiCustomizer openApiVersionCustomizer() {
        return openApi -> openApi.setOpenapi("3.0.3");
    }
}

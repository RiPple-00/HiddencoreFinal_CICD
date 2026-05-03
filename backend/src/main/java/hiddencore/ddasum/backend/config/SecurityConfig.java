package hiddencore.ddasum.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import hiddencore.ddasum.backend.security.JwtAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {
        http.csrf(org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.POST, "/api/auth/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.POST, "/api/guardians/signup")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/auth/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.POST, "/api/admin/**")
                                        .hasAnyRole("OFFICE", "ADMIN")
                                        .requestMatchers(HttpMethod.PATCH, "/api/users/me/**")
                                        .authenticated()
                                        .requestMatchers(HttpMethod.GET, "/api/members/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/rooms/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.DELETE, "/api/rooms/**")
                                        .permitAll()
                                        .requestMatchers("/api/schedules/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/meals/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.POST, "/api/meals/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/patients/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.POST, "/api/patients/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.PUT, "/api/patients/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/locations/**")
                                        .permitAll()
                                        .anyRequest()
                                        .permitAll())
                .httpBasic(org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer::disable)
                .formLogin(org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer::disable)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:8080",
                        "http://127.0.0.1:8080",
                        "http://localhost:8081",
                        "http://127.0.0.1:8081",
                        "http://localhost:8082",
                        "http://127.0.0.1:8082"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

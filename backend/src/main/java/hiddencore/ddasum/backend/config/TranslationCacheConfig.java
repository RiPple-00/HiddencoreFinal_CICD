package hiddencore.ddasum.backend.config;

import java.time.Duration;
import java.util.List;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.cache.CacheType;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;

import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
@EnableCaching
@EnableConfigurationProperties(TranslationProperties.class)
public class TranslationCacheConfig {

    private final TranslationProperties translationProperties;
    private final ObjectProvider<RedisConnectionFactory> redisConnectionFactoryProvider;

    public TranslationCacheConfig(TranslationProperties translationProperties,
            ObjectProvider<RedisConnectionFactory> redisConnectionFactoryProvider) {
        this.translationProperties = translationProperties;
        this.redisConnectionFactoryProvider = redisConnectionFactoryProvider;
    }

    @Bean
    public CacheManager cacheManager() {
        if (translationProperties.getCacheType() == TranslationProperties.CacheType.redis) {
            RedisConnectionFactory redisConnectionFactory = redisConnectionFactoryProvider.getIfAvailable();
            if (redisConnectionFactory != null) {
                RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofSeconds(translationProperties.getCacheTtlSeconds()))
                        .disableCachingNullValues();
                return RedisCacheManager.builder(redisConnectionFactory)
                        .cacheDefaults(cacheConfig)
                        .build();
            }
        }

        CaffeineCacheManager cacheManager = new CaffeineCacheManager("translation");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(translationProperties.getCacheTtlSeconds()))
                .maximumSize(translationProperties.getCacheMaximumSize()));
        return cacheManager;
    }
}

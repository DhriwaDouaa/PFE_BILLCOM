package com.example.timesten.config;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {
    @Value("${spring.datasource.url}")
    private String url;
    @Value("${spring.datasource.username}")
    private String username;
    @Value("${spring.datasource.password}")
    private String password;
    @Value("${spring.datasource.hikari.maximum-pool-size:10}")
    private int maxPoolSize;
    @Value("${spring.datasource.hikari.minimum-idle:2}")
    private int minIdle;

    @Bean
    @Primary
    public DataSource dataSource() {
        try {
            System.load("C:\\TimesTen\\tt221_64\\bin\\ttclient221.dll");
        } catch (UnsatisfiedLinkError e) {
            System.err.println("Avertissement chargement DLL: " + e.getMessage());
        }
        try {
            Class.forName("com.timesten.jdbc.TimesTenDriver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("TimesTen JDBC Driver not found in classpath", e);
        }

        HikariConfig config = new HikariConfig();
        config.setDriverClassName("com.timesten.jdbc.TimesTenDriver");
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setPoolName("TimesTenHikariPool");
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setConnectionTimeout(60000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);

        return new HikariDataSource(config);
    }
}

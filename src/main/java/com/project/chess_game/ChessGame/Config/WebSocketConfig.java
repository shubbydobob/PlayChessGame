package com.project.chess_game.ChessGame.Config;

import com.project.chess_game.ChessGame.Handler.WebSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final WebSocketHandler webSocketHandler;

    // WebSocketHandler를 생성자 주입받기 위해 @Autowired 사용
    @Autowired
    public WebSocketConfig(WebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    // WebSocket 핸들러를 등록하는 메서드
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // '/ws/room' URL에 대해 WebSocket 핸들러를 등록
        registry.addHandler(webSocketHandler, "/ws/room").setAllowedOrigins("*");
        // setAllowedOrigins("*")는 모든 도메인에서의 요청을 허용하는 설정입니다.
    }
    // WebSocket 핸들러 빈 등록
    @Bean
    public ServerEndpointExporter serverEndpointExporter(){
        return new ServerEndpointExporter();
    }
}

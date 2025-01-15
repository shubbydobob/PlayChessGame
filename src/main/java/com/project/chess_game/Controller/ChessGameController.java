package com.project.chess_game.Controller;

import com.project.chess_game.Handler.WebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ChessGameController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketHandler.class);

    @GetMapping ("/Room")
    private String RoomPage(){

        return "/Room";
    }

    @GetMapping("/ChessGame")
    public String chessGame(@RequestParam(required = false) Long roomId, Model model) {
        if (roomId == null) {
            throw new IllegalArgumentException("방 ID가 제공되지 않았습니다."); // 예외 처리 또는 기본값 설정
        }
        model.addAttribute("roomId", roomId);
        return "ChessGame"; // 템플릿 파일 이름
    }
}

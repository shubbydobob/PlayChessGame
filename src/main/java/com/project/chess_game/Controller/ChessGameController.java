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

    @GetMapping ("/")
    private String playChess(){
        logger.info("전 세계 체스 플레이어와 플레이하세요 !");
        return "/PlayChessGame";
    }

    @GetMapping ("/Login")
    private String LoginPage(){
        logger.info("로그인 해주세요 !");
        return "/Login/Login";
    }
    @GetMapping ("/Register")
    private String RegisterPage(){
        logger.info("회원가입 해주세요 !");
        return "/Login/Register";
    }

    @GetMapping ("/Room")
    private String RoomPage(){
        logger.info("방을 생성하여 체스 플레이를 해보세요!");
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

package com.project.chess_game.Controller;

import com.project.chess_game.Handler.WebSocketHandler;
import com.project.chess_game.Model.User;
import com.project.chess_game.Service.UserService;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Controller
public class ChessGameController {

    private static final Logger logger = LoggerFactory.getLogger(ChessGameController.class);
    private final UserService userService;

    // UserService를 의존성 주입
    @Autowired
    public ChessGameController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/")
    private String playChess(HttpSession session, Model model) {
        logger.info("전 세계 체스 플레이어와 플레이하세요 !");
        String loggedInUser = (String) session.getAttribute("loggedInUser");
        model.addAttribute("loggedInUser", loggedInUser); // 세션에 저장된 사용자 전달
        return "PlayChessGame";
    }

    @GetMapping("/Login")
    private String LoginPage() {
        logger.info("로그인 페이지 요청: 로그인 해주세요!");
        return "/Login/Login";
    }

    // 로그인 요청 처리
    @PostMapping("/Login")
    public String loginUser(@RequestParam String userId, @RequestParam String password, HttpSession session, Model model) {
        logger.info("로그인 요청: userId = {}", userId);

        User user = new User();
        user.setUserId(userId);
        user.setPassword(password);

        boolean isAuthenticated = userService.authenticateUser(user);
        if (isAuthenticated) {
            session.setAttribute("loggedInUser", userId); // 세션에 사용자 정보 저장
            logger.info("로그인 성공: userId = {}", userId);
            return "redirect:/"; // 메인 페이지로 리다이렉트
        } else {
            logger.warn("로그인 실패: userId = {}", userId);
            model.addAttribute("error", "잘못된 ID 또는 비밀번호입니다.");
            return "/Login/Login"; // 로그인 페이지로 다시 이동
        }
    }

    @GetMapping("/Register")
    private String RegisterPage() {
        logger.info("회원가입 페이지 요청: 회원가입 해주세요!");
        return "/Login/Register";
    }

    // 계정 생성 요청 처리
    @PostMapping("/Register")
    public String registerUser(@RequestParam String userId, @RequestParam String password, Model model) {
        logger.info("계정 생성 요청: userId = {}", userId);

        User user = new User();
        user.setUserId(userId);
        user.setPassword(password);

        boolean isCreated = userService.registerUser(user);
        if (isCreated) {
            logger.info("계정 생성 성공: userId = {}", userId);
            return "redirect:/Login"; // 로그인 페이지로 리다이렉트
        } else {
            logger.warn("계정 생성 실패: userId = {}", userId);
            model.addAttribute("error", "이미 존재하는 사용자 ID입니다.");
            return "/Login/Register"; // 계정 생성 페이지로 다시 이동
        }
    }

    @GetMapping("/Logout")
    public String logout(HttpSession session) {
        String userId = (String) session.getAttribute("loggedInUser");
        logger.info("로그아웃 요청: userId = {}", userId);

        session.invalidate(); // 세션 무효화
        logger.info("로그아웃 성공: userId = {}", userId);
        return "redirect:/Login"; // 로그인 페이지로 리다이렉트
    }

    @GetMapping("/Room")
    private String RoomPage() {
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

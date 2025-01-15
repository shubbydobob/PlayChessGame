package com.project.chess_game.Service;

import com.project.chess_game.Model.User;
import com.project.chess_game.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 계정 생성
    public boolean registerUser(User user) {
        logger.info("계정 생성 요청 받음 : 유저 ID = {}", user.getUserId());

        //이미 생성한 UserId 있는지 확인
        Optional<User> existingUser = userRepository.findByUserId(user.getUserId());
        if (existingUser.isPresent()) {
            logger.warn("계정 생성 실패 : 이미 존자하는 유저 ID = {}", user.getUserId());
            return false; //이미 존재
        }
        userRepository.save(user);
        logger.info("계정 생성 성공 : 유저 ID = {}", user.getUserId());
        return true; // 성공적으로 생성
    }

    // 유저 로그인
    public boolean authenticateUser(User user) {
        logger.info("로그인 요청 : 유저 ID = {}", user.getUserId());

        Optional<User> existingUser = userRepository.findByUserId(user.getUserId());
        if (existingUser.isPresent() && existingUser.get().getPassword().equals(user.getPassword())) {
            logger.info("로그인 성공: 유저 ID = {}", user.getUserId());
            return true; // 인증 성공
        }
        logger.warn("로그인 실패 : 유저 ID = {}", user.getUserId());
        return false;
    }
}  


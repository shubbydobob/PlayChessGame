package com.project.chess_game.ChessGame.Repository;

import com.project.chess_game.ChessGame.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository <User, Long> {
    Optional<User> findByUserId(String userId); // 사용자 이름으로 검색
}

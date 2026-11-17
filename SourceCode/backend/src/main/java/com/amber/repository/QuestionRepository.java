package com.amber.repository;

import com.amber.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    /**
     * Questions a visitor may see on a product page: all answered ones,
     * plus the viewer's own unanswered ones (viewerId null = not signed in).
     */
    @Query("""
            select q from Question q join fetch q.user
            where q.product.id = :productId
              and (q.answer is not null or q.user.id = :viewerId)
            order by q.createdAt desc, q.id desc
            """)
    List<Question> findVisible(Long productId, Long viewerId);

    /** Admin view of a product: every question. */
    @Query("""
            select q from Question q join fetch q.user
            where q.product.id = :productId
            order by q.createdAt desc, q.id desc
            """)
    List<Question> findAllForProduct(Long productId);

    /** Admin inbox: oldest unanswered first, so nobody waits too long. */
    @Query("""
            select q from Question q join fetch q.user join fetch q.product
            where q.answer is null
            order by q.createdAt asc, q.id asc
            """)
    List<Question> findUnanswered();

    @Query("""
            select q from Question q join fetch q.user join fetch q.product
            order by q.createdAt desc, q.id desc
            """)
    List<Question> findAllWithProductAndUser();

    @Query("select q from Question q join fetch q.user join fetch q.product where q.id = :id")
    Optional<Question> findWithProductAndUserById(Long id);

    long countByAnswerIsNull();
}

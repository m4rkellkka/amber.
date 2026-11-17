package com.amber.repository;

import com.amber.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

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
}

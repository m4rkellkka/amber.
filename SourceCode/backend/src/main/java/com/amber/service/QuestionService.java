package com.amber.service;

import com.amber.dto.QuestionDto;
import com.amber.entity.Product;
import com.amber.entity.Question;
import com.amber.entity.Role;
import com.amber.exception.NotFoundException;
import com.amber.repository.ProductRepository;
import com.amber.repository.QuestionRepository;
import com.amber.repository.UserRepository;
import com.amber.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Questions about products: who can see them and who can ask. Answering is done by the admin. */
@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public QuestionService(QuestionRepository questionRepository, ProductRepository productRepository,
                           UserRepository userRepository) {
        this.questionRepository = questionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /** viewer = null for visitors who are not signed in. */
    @Transactional(readOnly = true)
    public List<QuestionDto> listForProduct(Long productId, AuthUser viewer) {
        activeProduct(productId);
        Long viewerId = viewer == null ? null : viewer.id();
        List<Question> questions = viewer != null && viewer.role() == Role.ADMIN
                ? questionRepository.findAllForProduct(productId)
                : questionRepository.findVisible(productId, viewerId);
        return questions.stream().map(q -> QuestionDto.from(q, viewerId)).toList();
    }

    @Transactional
    public QuestionDto ask(Long productId, AuthUser author, String text) {
        Question question = new Question();
        question.setProduct(activeProduct(productId));
        question.setUser(userRepository.getReferenceById(author.id()));
        question.setText(text.trim());
        return QuestionDto.from(questionRepository.saveAndFlush(question), author.id());
    }

    private Product activeProduct(Long productId) {
        return productRepository.findById(productId)
                .filter(Product::isActive)
                .orElseThrow(() -> new NotFoundException("Product " + productId + " not found"));
    }
}

const router = require('express').Router();
import { createUser, getSingleUser, saveBook, deleteBook, login } from '../../controllers/user-controller';

// import middleware
import { authMiddleware } from '../../utils/auth';

// put authMiddleware anywhere we need to send a token for verification of user
router.route('/').post(createUser).put(authMiddleware, saveBook);

router.route('/login').post(login);

router.route('/me').get(authMiddleware, getSingleUser);

router.route('/books/:bookId').delete(authMiddleware, deleteBook);

export default router;

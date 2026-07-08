const express = require('express');
const router = express.Router();
const { getLeagues, getLeague, createLeague, updateLeague, deleteLeague, syncLeague } = require('../controllers/leagueController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getLeagues);
router.get('/:slug', getLeague);
router.post('/', protect, authorize('admin', 'editor'), createLeague);
router.put('/:id', protect, authorize('admin', 'editor'), updateLeague);
router.delete('/:id', protect, authorize('admin'), deleteLeague);
router.post('/:id/sync', protect, authorize('admin'), syncLeague);

module.exports = router;

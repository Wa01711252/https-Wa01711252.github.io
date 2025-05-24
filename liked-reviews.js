// liked-reviews.js

document.addEventListener('DOMContentLoaded', () => {
    const likedReviewsContainer = document.getElementById('liked-reviews-container');
    const noLikedReviewsMessage = document.getElementById('no-liked-reviews');

    // ハンバーガーメニュー関連の要素を取得
    const hamburgerToggle = document.querySelector('.hamburger-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    // ハンバーガーメニューの開閉イベントリスナー
    hamburgerToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active'); // active クラスの付け外し
        hamburgerToggle.classList.toggle('active'); // ハンバーガーアイコンの見た目変更用
    });


    // index.jsと同じユーザーIDシミュレーションが必要
    const currentUserId = 'user_' + Math.random().toString(36).substring(2, 9);

    loadLikedReviews();

    /**
     * テキスト内のHTML特殊文字をエスケープする関数
     * クロスサイトスクリプティング (XSS) 対策
     * @param {string} text - エスケープ対象の文字列
     * @returns {string} エスケープされた文字列
     */
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    /**
     * いいねしたレビューをDOMに追加して表示する関数
     * (addReviewToDOM とほぼ同じですが、いいねの状態更新ロジックは含みません)
     * @param {object} review - 追加するレビューオブジェクト
     */
    function addLikedReviewToDOM(review) {
        const reviewItem = document.createElement('div');
        reviewItem.classList.add('review-item'); // CSSクラスを追加

        // レビューの色を設定
        reviewItem.style.backgroundColor = review.color;

        reviewItem.innerHTML = `
            <h3>${escapeHTML(review.title)}</h3>
            <p>${escapeHTML(review.content)}</p>
            <div class="review-footer">
                <small>投稿日: ${review.dateTime}</small>
                <button class="like-button liked" data-review-id="${review.id}" disabled>
                    <span class="like-icon"></span> <span class="like-count">${review.likes}</span>
                </button>
            </div>
        `;

        // 付箋をランダムに少し回転させる
        const randomRotation = (Math.random() * 6) - 3;
        reviewItem.style.setProperty('--rotation-offset', randomRotation);

        likedReviewsContainer.prepend(reviewItem); // 先頭に追加
    }

    /**
     * localStorageからいいねしたレビューを読み込み、表示する関数
     */
    function loadLikedReviews() {
        let allReviews = JSON.parse(localStorage.getItem('aiReviews')) || [];
        // 現在のユーザーがいいねしたレビューのみをフィルタリング
        const likedReviews = allReviews.filter(review => review.likedBy && review.likedBy.includes(currentUserId));

        if (likedReviews.length > 0) {
            noLikedReviewsMessage.style.display = 'none'; // メッセージを非表示に
            // ★変更点: いいねしたレビューを逆順にしてからforEachで回す★
            likedReviews.reverse().forEach(review => {
                addLikedReviewToDOM(review);
            });
        } else {
            noLikedReviewsMessage.style.display = 'block'; // メッセージを表示
        }
    }
});

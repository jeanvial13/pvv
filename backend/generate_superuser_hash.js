const bcrypt = require('bcryptjs');

const password = 'Tessi1308';

bcrypt.hash(password, 10).then((hash) => {
    console.log('Generated hash for password "Tessi1308":');
    console.log(hash);

    // Verify it works
    bcrypt.compare(password, hash).then((matches) => {
        console.log(`\nVerification: ${matches ? 'SUCCESS ✓' : 'FAILED ✗'}`);
    });
});

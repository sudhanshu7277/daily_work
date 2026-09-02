// Remediation
Replace lines 72–74:

const validCode = (await
  this.userRepository.query(`SELECT * FROM codes WHERE code = "${body.code}"
  AND consumed = false`))[0];



  // With:

  const validCode = await this.codeRepository.findOne({
    where: {
      code: body.code,
      consumed: false,
    },
  });
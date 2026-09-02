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


  // alternate

  const validCode = (
    await this.codeRepository.query(
      'SELECT * FROM codes WHERE code = ? AND consumed = false',
      [body.code]
    )
  )[0];


  {
    "code": "\" or 1=1 --"
  }
private static readonly ALPHA_NUMERIC_SLASH_CHAR_REGEX =
/^[A-Za-z0-9àâçéèêëíîïòóôùûüÁÀÂÇÉÈÊËÍÌÎÏÓÒÔÚÙÛÜ.\-',/ ]$/;

private static readonly ALPHA_NUMERIC_SLASH_DISALLOWED_REGEX =
/[^A-Za-z0-9àâçéèêëíîïòóôùûüÁÀÂÇÉÈÊËÍÌÎÏÓÒÔÚÙÛÜ.\-',/ ]/g;
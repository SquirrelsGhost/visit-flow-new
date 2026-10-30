/**
 * Schutz vor Wegwerf-E-Mail-Adressen (Trash-Mail / Temp-Mail) und Alias-Tricks.
 * Verhindert anonyme Massenregistrierungen und das Umgehen von Kontosperren.
 */

const WEGWERF_DOMAINS = new Set([
  "0-mail.com", "0815.ru", "0clickemail.com", "10mail.org", "10minutemail.co.za",
  "10minutemail.com", "10minutemail.de", "10minutemail.net", "10minutemail.org", "10minutemail.us",
  "10minutesmail.com", "123mail.org", "1ce.us", "1chuan.com", "1mail.ml",
  "1pad.de", "20mail.in", "20mail.it", "20minutemail.com", "20minutemail.it",
  "2prong.com", "30minutemail.com", "33mail.com", "3d-painting.com", "4warding.com",
  "4warding.net", "4warding.org", "60minutemail.com", "675hosting.com", "6url.com",
  "75hosting.com", "7tags.com", "9ox.net", "a-bc.net", "abusemail.de",
  "abyssmail.com", "afrobacon.com", "ag.us.to", "agedmail.com", "ajaxapp.net",
  "amilegit.com", "amiri.net", "amiriindustries.com", "anonbox.net", "anonymbox.com",
  "antichef.com", "antichef.net", "antispam.de", "antispam24.de", "armyspy.com",
  "artman-conception.com", "azmeil.tk", "baxomale.ht.cx", "beefmilk.com", "bigstring.com",
  "binkmail.com", "bio-muesli.net", "bladesmail.net", "blogmyway.org", "bobmail.info",
  "bodhi.lawlita.com", "bofthew.com", "bootybay.de", "boun.cr", "bouncr.com",
  "breakthru.com", "brefmail.com", "brennendesreich.de", "broadbandninja.com", "bsnow.net",
  "bspamfree.org", "buffemail.com", "bugmenot.com", "bumpymail.com", "bund.us",
  "burnermail.io", "burstmail.info", "buymoreplays.com", "byom.de", "c2.hu",
  "card.zp.ua", "casualdx.com", "cek.pm", "centermail.com", "centermail.net",
  "chammy.info", "childsavetrust.org", "chogmail.com", "choicemail1.com", "clixser.com",
  "cmail.net", "cmail.org", "coldemail.info", "cool.fr.nf", "correo.blogos.net",
  "cosmorph.com", "courriel.fr.nf", "courrieltemporaire.com", "crapmail.org", "crazymailing.com",
  "cubiclink.com", "curryworld.de", "cust.in", "cuvox.de", "dacoolest.com",
  "dandikmail.com", "dayrep.com", "dcemail.com", "deadaddress.com", "deadspam.com",
  "delikkt.de", "despam.it", "despammed.com", "devnullmail.com", "dfgh.net",
  "digitalsanctuary.com", "dingbone.com", "discard.cf", "discard.email", "discard.ga",
  "discard.gq", "discard.ml", "discard.tk", "discardmail.com", "discardmail.de",
  "disposable.cf", "disposable.ga", "disposable.ml", "disposableaddress.com", "disposableemailaddresses.com",
  "disposableinbox.com", "dispose.it", "disposeamail.com", "disposemail.com", "dispostable.com",
  "dm.w3internet.co.uk", "dodgeit.com", "dodgit.com", "dodgit.org", "donemail.ru",
  "dontreg.com", "dontsendmespam.de", "drdrb.com", "drdrb.net", "dropmail.me",
  "duam.net", "dudmail.com", "dump-email.info", "dumpandjunk.com", "dumpmail.de",
  "dumpyemail.com", "e-mail.com", "e-mail.org", "e4ward.com", "easytrashmail.com",
  "einmalmail.de", "einrot.com", "einrot.de", "eintagsmail.de", "email60.com",
  "emaildienst.de", "emailgo.de", "emailias.com", "emailigo.de", "emailinfive.com",
  "emaillime.com", "emailmiser.com", "emailondeck.com", "emailproxsy.com", "emailsensei.com",
  "emailtemporanea.com", "emailtemporanea.net", "emailtemporar.ro", "emailtemporario.com.br", "emailthe.net",
  "emailtmp.com", "emailto.de", "emailwarden.com", "emailx.at.hm", "emailxfer.com",
  "emeil.in", "emeil.ir", "emkei.cz", "emz.net", "enterto.com",
  "ephemail.net", "etranquil.com", "etranquil.net", "etranquil.org", "evopo.com",
  "explodemail.com", "express.net.ua", "eyepaste.com", "fakeinbox.com", "fakeinformation.com",
  "fakemail.fr", "fakemailgenerator.com", "fakemailz.com", "fammix.com", "fansworldwide.de",
  "fantasymail.de", "fastacura.com", "fastchevy.com", "fastchrysler.com", "fastkawasaki.com",
  "fastmazda.com", "fastmitsubishi.com", "fastnissan.com", "fastsubaru.com", "fastsuzuki.com",
  "fasttoyota.com", "fastyamaha.com", "filzmail.com", "fizmail.com", "fleckens.hu",
  "fr33mail.info", "frapmail.com", "freundin.ru", "friendlymail.co.uk", "front14.org",
  "fuckingduh.com", "fudgerub.com", "fux0ringduh.com", "garliclife.com", "gehensiemirnichtaufdensack.de",
  "gelitik.in", "generator.email", "get1mail.com", "get2mail.fr", "getairmail.cf",
  "getairmail.com", "getairmail.ga", "getairmail.gq", "getairmail.ml", "getairmail.tk",
  "getmails.eu", "getnada.com", "getonemail.com", "getonemail.net", "ghosttexter.de",
  "girlsundertheinfluence.com", "gishpuppy.com", "gmial.com", "goemailgo.com", "gorillaswithdirtyarmpits.com",
  "gotmail.com", "gotmail.net", "gotmail.org", "gotti.otherinbox.com", "gowikibooks.com",
  "great-host.in", "greensloth.com", "grr.la", "gsrv.co.uk", "guerillamail.biz",
  "guerillamail.com", "guerillamail.de", "guerillamail.info", "guerillamail.net", "guerillamail.org",
  "guerrillamail.biz", "guerrillamail.com", "guerrillamail.de", "guerrillamail.info", "guerrillamail.net",
  "guerrillamail.org", "guerrillamailblock.com", "gustr.com", "harakirimail.com", "hat-geld.de",
  "hatespam.org", "herp.in", "hidemail.de", "hidzz.com", "hmamail.com",
  "hochsitze.com", "hopemail.biz", "hotpop.com", "hulapla.de", "ieatspam.eu",
  "ieatspam.info", "ieh-mail.de", "ihateyoualot.info", "iheartspam.org", "imails.info",
  "imgof.com", "imstations.com", "inbax.tk", "inbox.si", "inboxalias.com",
  "inboxclean.com", "inboxclean.org", "inboxkitten.com", "incognitomail.com", "incognitomail.net",
  "incognitomail.org", "insorg-mail.info", "instant-mail.de", "instantemailaddress.com", "ipoo.org",
  "irish2me.com", "iwi.net", "jetable.com", "jetable.fr.nf", "jetable.net",
  "jetable.org", "jnxjn.com", "jourrapide.com", "jsrsolutions.com", "junk1e.com",
  "kasmail.com", "kaspop.com", "keepmymail.com", "killmail.com", "killmail.net",
  "kir.ch.tc", "klassmaster.com", "klassmaster.net", "klzlk.com", "kook.ml",
  "kulturbetrieb.info", "kurzepost.de", "l33r.eu", "lackmail.net", "lags.us",
  "landmail.co", "lastmail.co", "lastmail.com", "lazyinbox.com", "letthemeatspam.com",
  "lhsdv.com", "lifebyfood.com", "link2mail.net", "litedrop.com", "lol.ovpn.to",
  "lookugly.com", "lopl.co.cc", "lortemail.dk", "lr78.com", "lroid.com",
  "lukop.dk", "m4ilweb.info", "maboard.com", "mail-temporaire.fr", "mail.by",
  "mail.mezimages.net", "mail2rss.org", "mail333.com", "mail4trash.com", "mailbidon.com",
  "mailblocks.com", "mailcatch.com", "maildrop.cc", "maildrop.cf", "maildrop.ga",
  "maildrop.gq", "maildrop.ml", "maildu.de", "maildx.com", "maileater.com",
  "mailexpire.com", "mailfa.tk", "mailforspam.com", "mailfree.ga", "mailfree.gq",
  "mailfree.ml", "mailfreeonline.com", "mailfs.com", "mailguard.me", "mailimate.com",
  "mailin8r.com", "mailinater.com", "mailinator.com", "mailinator.gq", "mailinator.net",
  "mailinator.org", "mailinator.us", "mailinator2.com", "mailincubator.com", "mailismagic.com",
  "mailjunk.cf", "mailjunk.ga", "mailjunk.gq", "mailjunk.ml", "mailjunk.tk",
  "mailmate.com", "mailme.gq", "mailme.ir", "mailme.lv", "mailme24.com",
  "mailmetrash.com", "mailmoat.com", "mailnator.com", "mailnesia.com", "mailnull.com",
  "mailpick.biz", "mailproxsy.com", "mailquack.com", "mailrock.biz", "mailsac.com",
  "mailscrap.com", "mailseal.de", "mailshell.com", "mailsiphon.com", "mailslapping.com",
  "mailslite.com", "mailtemp.info", "mailtothis.com", "mailzilla.com", "mailzilla.org",
  "makemetheking.com", "manifestgenerator.com", "manybrain.com", "mbx.cc", "mega.zik.dj",
  "meinspamschutz.de", "meltmail.com", "messagebeamer.de", "mezimages.net", "mierdamail.com",
  "migumail.com", "mintemail.com", "mjukglass.nu", "moakt.com", "mobi.web.id",
  "mobileninja.co.uk", "moburl.com", "mohmal.com", "moncourrier.fr.nf", "monemail.fr.nf",
  "monmail.fr.nf", "monumentmail.com", "ms9.mailslite.com", "msa.minsmail.com", "mt2009.com",
  "mt2014.com", "mt2015.com", "muellmail.com", "mvrht.com", "mycleaninbox.net",
  ".mytemp.email", "mytemp.email", "mytempemail.com", "mytempmail.com", "mytrashmail.com",
  "nada.email", "nada.ltd", "neomailbox.com", "nepwk.com", "nervmich.net",
  "nervtmich.net", "netmails.com", "netmails.net", "netzidiot.de", "neverbox.com",
  "no-spam.ws", "nobulk.com", "noclickemail.com", "nogmailspam.info", "nomail.xl.cx",
  "nomail2me.com", "nomorespamemails.com", "nospam.ze.tc", "nospam4.us", "nospamfor.us",
  "nospamthanks.info", "notmailinator.com", "nowmymail.com", "nurfuerspam.de", "nwldx.com",
  "objectmail.com", "obobbo.com", "odaymail.com", "one-time.email", "oneoffemail.com",
  "oneoffmail.com", "onewaymail.com", "oopi.org", "opayq.com", "ordinaryamerican.net",
  "otherinbox.com", "ourklips.com", "outlawspam.com", "ovpn.to", "owlpic.com",
  "pancakemail.com", "paplease.com", "pcusers.otherinbox.com", "pepbot.com", "pfui.ru",
  "pimpedupmyspace.com", "pjjkp.com", "plexolan.de", "pookmail.com", "privacy.net",
  "privatdemail.net", "proxymail.eu", "prtnx.com", "putthisinyourspamdatabase.com", "qq.com",
  "quickinbox.com", "rcpt.at", "reallymymail.com", "recode.me", "recursor.net",
  "recyclemail.dk", "regbypass.com", "rejectmail.com", "rhyta.com", "rklips.com",
  "rmqkr.net", "rppkn.com", "rtrtr.com", "s0ny.net", "safe-mail.net",
  "safersignup.de", "safetymail.info", "safetypost.de", "sandelf.de", "saynotospams.com",
  "schafmail.de", "schrott-email.de", "secretemail.de", "secure-mail.biz", "selfdestructingmail.com",
  "sendspamhere.com", "sharklasers.com", "shieldedmail.com", "shiftmail.com", "shitmail.me",
  "shitmail.org", "shortmail.net", "sibmail.com", "skeefmail.com", "slaskpost.se",
  "slopsbox.com", "smashmail.de", "smellfear.com", "snakemail.com", "sneakemail.com",
  "sneakmail.de", "snkmail.com", "sofimail.com", "sofort-mail.de", "sofortmail.de",
  "sogetthis.com", "soodonims.com", "spam.la", "spam.su", "spam4.me",
  "spamavert.com", "spambob.com", "spambob.net", "spambob.org", "spambog.com",
  "spambog.de", "spambog.net", "spambog.ru", "spambox.info", "spambox.us",
  "spamcannon.com", "spamcannon.net", "spamcero.com", "spamcon.org", "spamcorptastic.com",
  "spamcowboy.com", "spamcowboy.net", "spamcowboy.org", "spamday.com", "spamex.com",
  "spamfree.eu", "spamfree24.com", "spamfree24.de", "spamfree24.eu", "spamfree24.info",
  "spamfree24.net", "spamfree24.org", "spamgoes.in", "spamgourmet.com", "spamherelots.com",
  "spamhereplease.com", "spamhole.com", "spamify.com", "spaminator.de", "spamkill.info",
  "spaml.com", "spaml.de", "spammotel.com", "spamobox.com", "spamoff.de",
  "spamslicer.com", "spamspot.com", "spamstack.net", "spamthis.co.uk", "spamthisplease.com",
  "spamtrail.com", "spamtroll.net", "speed.1s.fr", "spoofmail.de", "squizzy.de",
  "stuffmail.de", "super-auswahl.de", "supergreatmail.com", "supermailer.jp", "superrito.com",
  "superstachel.de", "suremail.info", "svk.jp", "sweetxxx.de", "tafmail.com",
  "talkinator.com", "tapchicuoihoi.com", "teewars.org", "teleworm.com", "teleworm.us",
  "temp-mail.com", "temp-mail.de", "temp-mail.org", "temp-mail.ru", "tempail.com",
  "tempalias.com", "tempe-mail.com", "tempemail.biz", "tempemail.co.za", "tempemail.com",
  "tempemail.net", "tempinbox.co.uk", "tempinbox.com", "tempmail.co", "tempmail.de",
  "tempmail.eu", "tempmail.it", "tempmail.net", "tempmail.us", "tempmail2.com",
  "tempmaildemo.com", "tempmailer.com", "tempmailer.de", "tempmailo.com", "tempomail.fr",
  "temporarily.de", "temporarioemail.com.br", "temporaryemail.net", "temporaryemail.us", "temporaryforwarding.com",
  "temporaryinbox.com", "temporarymailaddress.com", "tempr.email", "tempthe.net", "thankyou2010.com",
  "thisisnotmyrealemail.com", "thismail.net", "throwam.com", "throwawayemailaddress.com", "throwawaymail.com",
  "tilien.com", "tittbit.in", "tmailinator.com", "tmpmail.net", "tmpmail.org",
  "toiea.com", "toomail.biz", "topranklist.de", "tradermail.info", "trash-amil.com",
  "trash-mail.at", "trash-mail.com", "trash-mail.de", "trash2009.com", "trash2010.com",
  "trash2011.com", "trashdevil.com", "trashdevil.de", "trashemail.de", "trashmail.at",
  "trashmail.com", "trashmail.de", "trashmail.me", "trashmail.net", "trashmail.org",
  "trashmail.ws", "trashmailer.com", "trashymail.com", "trashymail.net", "trbvm.com",
  "trialmail.de", "trickmail.net", "trillianpro.com", "turual.com", "twinmail.de",
  "tyldd.com", "uggsrock.com", "umail.net", "upliftnow.com", "uplipht.com",
  "uroid.com", "valemail.net", "venompen.com", "veryrealemail.com", "viditag.com",
  "viewcastmedia.com", "viewcastmedia.net", "viewcastmedia.org", "vomoto.com", "vubby.com",
  "walala.org", "walkmail.net", "webemail.me", "webm4il.info", "weg-werf-email.de",
  "wegwerf-email-addressen.de", "wegwerf-email-adressen.de", "wegwerf-email.at", "wegwerf-email.de", "wegwerf-email.net",
  "wegwerf-emails.de", "wegwerfadresse.de", "wegwerfemail.com", "wegwerfemail.de", "wegwerfemail.info",
  "wegwerfemail.net", "wegwerfemail.org", "wegwerfemailadresse.com", "wegwerfmail.de", "wegwerfmail.info",
  "wegwerfmail.net", "wegwerfmail.org", "wegwerpmailadres.nl", "wh4f.org", "whatiaas.com",
  "whatpaas.com", "whopy.com", "whyspam.me", "willhackforfood.biz", "willselfdestruct.com",
  "winemaven.info", "wronghead.com", "wuzup.net", "wuzupmail.net", "wwwnew.eu",
  "xagloo.com", "xemaps.com", "xents.com", "xmaily.com", "xoxy.net",
  "yep.it", "yogamaven.com", "yopmail.com", "yopmail.fr", "yopmail.net",
  "yuurok.com", "z1p.biz", "za.com", "zehnminuten.de", "zehnminutenmail.de",
  "zippymail.info", "zoaxe.com", "zoemail.com", "zoemail.net", "zoemail.org",
]);

const MUSTER =
  /(tempmail|trashmail|wegwerf|10minutemail|guerrillamail|mailinator|throwaway|fakeinbox|burnermail|spambox|disposable|einmalmail|muellmail|spambog|yopmail|sharklasers)/i;

/** Prüft, ob die Domain zu einem bekannten Wegwerf- oder Trash-Mail-Dienst gehört. */
export function istWegwerfEmail(email: string): boolean {
  const teile = email.trim().toLowerCase().split("@");
  if (teile.length !== 2) return true;
  const domain = teile[1];
  if (!domain || !domain.includes(".")) return true;
  if (WEGWERF_DOMAINS.has(domain)) return true;
  const punkte = domain.split(".");
  if (punkte.length > 2) {
    const hauptDomain = punkte.slice(-2).join(".");
    if (WEGWERF_DOMAINS.has(hauptDomain)) return true;
  }
  return MUSTER.test(domain);
}

/**
 * Kanonische Form einer E-Mail-Adresse zum Schutz vor Multi-Accounts & Sperr-Umgehung:
 * - entfernt Plus-Aliase (z. B. max+test@gmail.com → max@gmail.com)
 * - entfernt Punkte im Lokalteil bei Gmail/Googlemail (m.a.x@googlemail.com → max@gmail.com)
 */
export function kanonischeEmail(email: string): string {
  const sauber = email.trim().toLowerCase();
  const [lokalRoh, domainRoh] = sauber.split("@");
  if (!lokalRoh || !domainRoh) return sauber;
  let lokal = lokalRoh.split("+")[0] ?? lokalRoh;
  let domain = domainRoh;
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") lokal = lokal.replace(/\./g, "");
  return `${lokal}@${domain}`;
}

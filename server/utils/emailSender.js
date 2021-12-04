module.exports = smtpTransportYour => {
  'use strict';

  function getHtmlBody(unitate, cui, email, pass, resetPass) {
    resetPass = resetPass ? ' nouă' : '';
    return `<div style="width:100%; height:100%; margin:0; padding:0; text-align:left; font-family:Arial,'times new roman',times,serif;">
      <div style="padding: 30px; background-color:rgb(225,227,226);">
        <div style="width:100%; max-width:680px; margin:0 auto; padding: 10px; background-color:#ffffff">
          <div style="padding:15px 20px;">
            <a href="https://your-impozite.herokuapp.com" style="text-decoration:none; font-size: 28px; font-weight: bold; color: #000000;">Impozite și taxe locale</a>
          </div>
          <table cellpadding="0" cellspacing="0" style="width:100%; min-width:100%; padding:0 5px;">
            <tbody>
            <tr>
              <td style="height:1px; line-height:1px; font-size:1px; background-color:rgb(164,164,164)"><br></td>
            </tr>
            </tbody>
          </table>
          <div style="padding:13px 20px; line-height:1.5; font-size:16px; font-family:arial,helvetica,sans-serif">
            Adresă aplicație online: <a href="https://your-impozite.herokuapp.com"><b>https://your-impozite.herokuapp.com</b></a><br>
            ${unitate ? `Unitate: <b>${unitate}</b><br>` : ''}
            ${cui ? `Cod Fiscal: <b>${cui}</b><br><br>` : ''}
            <b>Date de autentificare:</b>
            <div style="margin: 0; padding: 15px; background-color: #cfd1d0;">
              Email: <b>${email}</b><br>
              Parolă ${resetPass}: <b>${pass}</b>
            </div>
            <br>
            <b>Autentificarea se face cu adresa de email și parola.</b><br><br>
            Pentru a beneficia de cele mai bune performanțe, este de preferat accesarea platformei cu browser-ul Google Chrome!<br><br>
            Vă mulțumim,<br>
            <a href="https://yourconsulting.ro"><b>Echipa YourConsulting</b></a><br>
          </div>
          <table cellpadding="0" cellspacing="0" style="width:100%; min-width:100%; padding:0 5px;">
            <tbody>
            <tr>
              <td style="height:1px; line-height:1px; font-size:1px; background-color:rgb(164,164,164)"><br></td>
            </tr>
            </tbody>
          </table>
          <div style="padding:15px 20px; font-size:11px; line-height:21px; font-family:arial,helvetica,sans-serif">
            &copy; YourConsulting. Toate drepturile rezervate.<br> Acesta este un email generat automat. Te rugăm să nu răspunzi la acest email.
          </div>
        </div>
      </div>
    </div>`;
  }

  return {
    sendMail: (unitate, cui, email, pass, resetPass) => {
      if (config.env === 'production' && email) {
        let mailOptions = {
          from: 'YourConsulting - Impozite si Taxe ✔ <office.yourconsulting@gmail.com>',
          to: [email, 'ungurean.cristian@gmail.com', 'ostasuc.danut@gmail.com', 'nicolae.todosi@gmail.com', 'costi.tuca@gmail.com'],
          subject: 'YourConsulting - Impozite si Taxe',
          html: getHtmlBody(unitate, cui, email, pass, resetPass)
        };
        smtpTransportYour.sendMail(mailOptions, (error) => {
          if (error) {
            console.log('Email send err: ', error);
          } else {
            console.log('Email send YC!! ');
          }
        });
      } else {
        return null;
      }
    },

    sendMailBnr: text => {
      if (config.env === 'production') {
        let mailOptions = {
          from: 'YourConsulting - Impozite si Taxe ✔ <office.yourconsulting@gmail.com>',
          to: ['ungurean.cristian@gmail.com', 'ostasuc.danut@gmail.com', 'nicolae.todosi@gmail.com', 'costi.tuca@gmail.com'],
          subject: 'YourConsulting - Impozite si Taxe - Actualizare curs valutar',
          text: text
        };
        smtpTransportYour.sendMail(mailOptions, (error) => {
          if (error) {
            console.log('Email send err: ', error);
          } else {
            console.log('Email send YC!! ');
          }
        });
      } else {
        return null;
      }
    },

    sendMailDocument: (user, email) => {
      //if (config.env === 'production' && email) {
        let mailOptions = {
          from: 'YourConsulting - Impozite si Taxe ✔ <office.yourconsulting@gmail.com>',
          //to: [email, 'nicolae.todosi@gmail.com'],
          to: [email],
          subject: 'Emitere factură',
          text: '\t Factura' + '\n\n' +
          '\t\tUnitate: ' + user.unit.name + '\n\n' +
          '\t\tCod Fiscal: ' + user.unit.cui + '\n\n' +

          '\t\tAutentificarea se poate face cu adresa de email sau cu codul fiscal și parola\n\n' +
          '\t\tAplicația se accesează doar cu browserul Google Chrome\n'
        };

        smtpTransportYour.sendMail(mailOptions, (error) => {
          if (error) {
            console.log('Email send err: ', error);
          } else {
            console.log('Email send YC!! ');
          }
        });
      //} else {
      //  return null;
      //}
    },

    sendMailErr: text => {
      if (config.env === 'production') {
        let mailOptions = {
          from: 'YourConsulting - Impozite si Taxe ✔ <office.yourconsulting@gmail.com>',
          to: ['ungurean.cristian@gmail.com', 'ostasuc.danut@gmail.com', 'nicolae.todosi@gmail.com', 'costi.tuca@gmail.com'],
          subject: 'YourConsulting - eroare Impozite si Taxe',
          text: text
        };
        smtpTransportYour.sendMail(mailOptions, error => {
          if (error) {
            console.log('Email send err: ', error);
          } else {
            console.log('Email send YC!! ');
          }
        });
      } else {
        return null;
      }
    }
  };
};

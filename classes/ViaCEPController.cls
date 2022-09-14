public without sharing class ViaCEPController {

    @AuraEnabled(cacheable=true)
    public static ViaCep chamarServico(String cep) {
        return consultarCEP(cep);
    }

    @AuraEnabled
    public static String updateAccountAddress(String accountJSON) {
        String result;
        try {
            Account acct = (Account) JSON.deserialize(accountJSON, Account.class);
            update acct;

            result = 'success';
        } catch (Exception ex) {
            System.debug('Error: ' + ex.getMessage());
            result = 'error';
        }

        return result;
    }

    public static ViaCep consultarCEP(String cep) {
        Viacep result = new Viacep();
        HttpRequest request = new HttpRequest();
        // Não esquecer de cadastrar o viacep como site remoto
        request.setEndpoint('https://viacep.com.br/ws/' + cep + '/json/');
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(120000);

        try {
            Http http = new Http();
            HttpResponse res = http.send(request);
            
            if(res.getStatusCode() == 200) {
                result = parse(res.getBody());
            } else {
                result.erro = true;
            }
        } catch(Exception ex) {
            result.erro = true;
        }

        return result;
    }

    public static ViaCep parse(String json) {
        return (ViaCep) System.JSON.deserialize(json, ViaCep.class);
    }
    
    public class ViaCep {
        @AuraEnabled
        public String cep;
        @AuraEnabled
        public String logradouro;
        @AuraEnabled
        public String complemento;
        @AuraEnabled
        public String bairro;
        @AuraEnabled
        public String localidade;
        @AuraEnabled
        public String uf;
        @AuraEnabled
        public String unidade;
        @AuraEnabled
        public String ibge;
        @AuraEnabled
        public String gia;
        @AuraEnabled
        public Boolean erro;
    }
}
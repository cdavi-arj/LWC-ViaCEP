public with sharing class ViaCEPController {

    @AuraEnabled(cacheable=true)
    public static ViaCep chamarServico(String cep) {
        return getAddressByCEP(cep);
    }

    public static ViaCep getAddressByCEP(String cep) {
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
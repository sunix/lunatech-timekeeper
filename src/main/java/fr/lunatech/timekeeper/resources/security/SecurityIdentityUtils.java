package fr.lunatech.timekeeper.resources.security;

import fr.lunatech.timekeeper.models.Profile;
import fr.lunatech.timekeeper.services.dtos.UserRequest;
import io.quarkus.security.identity.SecurityIdentity;
import org.jose4j.jwt.JwtClaims;
import org.jose4j.jwt.MalformedClaimException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.json.JsonObject;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class SecurityIdentityUtils {

    private static Logger logger = LoggerFactory.getLogger(SecurityIdentityUtils.class);


    public static Optional<UserRequest> getUserRequest(SecurityIdentity securityIdentity) {
        if (securityIdentity.getPrincipal() instanceof io.quarkus.oidc.runtime.OidcJwtCallerPrincipal) {
            final var jwtCallerPrincipal = (io.quarkus.oidc.runtime.OidcJwtCallerPrincipal) securityIdentity.getPrincipal();
            final var jwtClaims = jwtCallerPrincipal.getClaims();
            final String email = jwtClaims.getClaimValueAsString("email");
            final String firstName = jwtClaims.getClaimValueAsString("given_name");
            final String lastName = jwtClaims.getClaimValueAsString("family_name");
            //TODO use for organization ==> final String organization = jwtClaims.getClaimValueAsString("organization");
            final String picture = jwtClaims.getClaimValueAsString("picture");

            final List<Profile> profiles = getProfiles(securityIdentity, jwtClaims);
            if (profiles.isEmpty()) {
                logger.warn("No profile detected: " + securityIdentity.getPrincipal());
                return Optional.empty();
            }

            return Optional.of(new UserRequest(firstName, lastName, email, picture, profiles));

        } else {
            logger.warn("Unknown identity.getPrincipal: " + securityIdentity.getPrincipal());
            return Optional.empty();
        }
    }

    private static List<Profile> getProfiles(SecurityIdentity securityIdentity, JwtClaims jwtClaims) {
        JsonObject realmAccess = null;
        try {
            realmAccess = jwtClaims.getClaimValue("realm_access", JsonObject.class);
        } catch (MalformedClaimException e) {
            logger.warn("Can't retrieve a valid [realm_access] jwt claims: " + securityIdentity.getPrincipal());
        }

        return Optional.ofNullable(realmAccess)
                .map(jsonObject ->  jsonObject
                        .getJsonArray("roles")
                        .stream()
                        .map(Object::toString)
                        .map(s -> s.replaceAll("\"", ""))
                        .map(Profile::findProfileByName)
                        .filter(Optional::isPresent)
                        .map(Optional::get)
                        .collect(Collectors.toList())
                )
                .orElseGet(Collections::emptyList);
    }
}
import { LegalPageLayout } from "@/features/legal/components/legal-page-layout";

const SECTION_HEADING_CLASS =
  "mt-8 text-xl font-semibold tracking-tight text-foreground";
const PARAGRAPH_CLASS = "text-foreground/90";
const LIST_CLASS = "list-disc space-y-2 pl-6 text-foreground/90";

export function PrivacyPolicyView() {
  return (
    <LegalPageLayout title="Subi Privacy Notice" lastUpdated="March 30, 2026">
      <p className={PARAGRAPH_CLASS}>
        Subi Incorporated and its affiliates and subsidiaries (
        <strong>“Subi,”</strong> <strong>“Marian,”</strong>{" "}
        <strong>“we,”</strong> <strong>“us,”</strong> or <strong>“our”</strong>)
        respect your privacy. This Privacy Notice (<strong>“Notice”</strong>)
        describes the processing of Personal Information (defined below) that is
        provided, collected, or disclosed while providing our products or
        services to you through the Subi app, (<strong>“Services”</strong>) and
        on the websites, other applications, and online platforms that link to
        this Notice (collectively, the <strong>“Site”</strong>). It also
        describes rights you may have under applicable laws. Please read this
        Notice carefully to understand our policies and practices regarding your
        Personal Information and how we will treat it.
      </p>

      <h2 className={SECTION_HEADING_CLASS}>Personal Information We Collect</h2>
      <p className={PARAGRAPH_CLASS}>
        We collect several categories of Personal Information from and about
        users of the Site. <strong>“Personal Information”</strong> means
        information that uniquely identifies, relates to, describes, or is
        reasonably capable of being associated with or linked to you. The
        categories of Personal Information we collect may include:
      </p>
      <ul className={LIST_CLASS}>
        <li>
          <em>Contact Information</em> – If you submit an inquiry, register for
          an account, or provide information on or through the Site, we may
          collect your contact information including your name, mailing
          address, email address, and phone number.
        </li>
        <li>
          <em>Commercial Information</em> – If you submit an inquiry, or provide
          information through the Site, we may collect commercial information
          including information about your purchases, subscriptions, and
          Services you have shown interest in.
        </li>
        <li>
          <em>Usage Information</em> – When you use the Site, we may
          automatically record information, including your Internet Protocol
          address (IP Address), geolocation of your device (which may be
          precise or approximate depending on your device settings and
          permissions), including for mileage tracking purposes, browser type,
          referring URLs, domain names associated with your internet service
          provider, and any other information regarding your interaction with
          the Site.
        </li>
        <li>
          <em>Communication Information</em> – We may collect Personal
          Information contained within your communications with us via email,
          chat functionality, social media, telephone, or otherwise, and in
          certain cases we may use third-party service providers to do so.
          Where permitted by applicable law, we may collect and maintain
          records of calls and chats with our agents, representatives, or
          employees via message, chat, post, or similar functionality. If you
          allow the Site to access or integrate your email, texts, calls, or
          any other communication forum, we may collect Personal Information
          contained within your communications with third parties via email,
          text, call, or otherwise.
        </li>
        <li>
          <em>Financial Information</em> – If you choose to upgrade to a
          premium subscription, we will collect and process financial
          information, such as credit card details, to upgrade your
          subscription.
        </li>
        <li>
          <em>Transaction Information</em> – If you upload or allow the Site to
          access documents related to real estate transactions, including but
          not limited to purchase agreements, addendums, contingencies, and
          escrow agreements, we may collect Personal Information contained
          within those documents, including financial information, such as
          account numbers and insurance information.
        </li>
        <li>
          <em>Voice and Audio Data</em> – If you utilize the voice recognition
          capability of the Site’s virtual assistant service, we may collect
          Personal Information contained within your audio communication with
          the Site, as well as audio recordings of your voice.
        </li>
      </ul>

      <h2 className={SECTION_HEADING_CLASS}>Sensitive Personal Information</h2>
      <p className={PARAGRAPH_CLASS}>
        Certain data we collect may be considered{" "}
        <strong>“Sensitive Personal Information”</strong> under applicable law,
        including financial account information, precise geolocation, and
        contents of communications. We use such information only as reasonably
        necessary to provide the Services, ensure security, and comply with
        legal obligations. We do not use Sensitive Personal Information for
        purposes other than those permitted by applicable law.
      </p>

      <h2 className={SECTION_HEADING_CLASS}>How We Collect Personal Information</h2>
      <ul className={LIST_CLASS}>
        <li>
          <em>Directly From You</em> – We collect Personal Information that you
          provide to us directly, for example, if you choose to contact us,
          request information from us, sign up to receive updates, upload or
          allow access to documents, or integrate or allow access to text
          messages, email, and calling capabilities, or otherwise utilize the
          Site.
        </li>
        <li>
          <em>From Third Parties</em> – We may collect Personal Information
          from third parties, including but not limited to business partners,
          advertising networks, social networks, data analytics providers,
          mobile device providers, and Internet or mobile service providers.
          We may also collect Personal information from apps and third-party
          services you connect to the Site.
        </li>
        <li>
          <em>Through Online Tracking Technologies</em> – We use cookies and
          similar technologies to collect Personal Information automatically as
          you navigate the Site. For additional information regarding our use
          of these technologies, see the <em>Cookies and Tracking Technologies</em>
          {" "}section below.
        </li>
      </ul>

      <h2 className={SECTION_HEADING_CLASS}>How We Use Personal Information</h2>
      <p className={PARAGRAPH_CLASS}>
        To the extent permitted by applicable law, we use Personal Information:
      </p>
      <ul className={LIST_CLASS}>
        <li>
          <em>To provide and personalize our Site and Services</em>, such as
          providing and personalizing our Services, providing customer service,
          maintaining or servicing accounts, verifying customer information,
          creating and maintaining business records, verifying eligibility, and
          undertaking or providing similar services.
        </li>
        <li>
          <em>To optimize, improve, and maintain our Services</em>, including
          understanding how users interact with our Services, gauging user
          interest in certain Services or the Site functionality, and
          troubleshooting problems.
        </li>
        <li>
          <em>For internal research and development</em>, such as testing,
          verifying, and improving the quality of our Services or developing
          new ones, including but not limited to using Personal Information to
          train and improve an internal artificial intelligence model to
          provide our Services.
        </li>
        <li>
          <em>For marketing and advertising</em>, including using your
          information to send you messages, notices, newsletters, surveys,
          promotions, or event invitations about our own or third parties’
          goods and services that may be of interest to you. We also use
          Personal Information to conduct interest-based advertising as
          discussed in the <em>Cookies and Other Tracking Technologies</em>{" "}
          section below. You can also unsubscribe from any marketing emails or
          text messages that we may send you by following the instructions
          included in the email or text correspondence.
        </li>
        <li>
          <em>For communicating with you</em>, such as responding to your
          questions and comments or notifying you of changes to the Site or
          Services.
        </li>
        <li>
          <em>For legal, security, or safety reasons</em>, such as protecting
          our and our users’ safety, property, or rights; complying with legal
          requirements; enforcing our terms, conditions, and policies;
          detecting, preventing, and responding to security incidents; and
          protecting against malicious, deceptive, fraudulent, or illegal
          activity.
        </li>
        <li>
          <em>As part of a corporate transaction</em>, such as in connection
          with the sale of part or all of our assets or business, the
          acquisition of part or all of another business or another business’
          assets, or another corporate transaction, including bankruptcy.
        </li>
        <li>
          <em>To fulfill any other purpose for which you provide it</em>,
          including purposes described when you provide the information or
          give your consent.
        </li>
      </ul>

      <h2 className={SECTION_HEADING_CLASS}>How We Disclose Personal Information</h2>
      <p className={PARAGRAPH_CLASS}>
        We may disclose aggregated information about our users, and information
        that does not identify any individual, without restriction.
      </p>
      <p className={PARAGRAPH_CLASS}>
        We may disclose your Personal Information with your consent or in the
        following circumstances:
      </p>
      <ul className={LIST_CLASS}>
        <li>
          <em>Employees and Other Personnel</em> – We may share Personal
          Information with our employees and personnel (such as contractors)
          who have a need to know the information for our business purposes.
        </li>
        <li>
          <em>Affiliates and Subsidiaries</em> – We may share Personal
          Information within our family of companies for their and our
          business and marketing purposes, including providing you with
          information about the Services we think may be of interest to you.
        </li>
        <li>
          <em>Service Providers</em> – We disclose your Personal Information
          with the service providers that we use to support our business,
          including but not limited to, artificial intelligence providers,
          website hosting providers, and other technology providers.
        </li>
        <li>
          <em>Business Partners</em> – We may disclose Personal Information
          with trusted business partners. For example, we may disclose your
          Personal Information with a company whose products or services we
          think may be of interest to you or who we co-sponsor a promotion or
          service with.
        </li>
        <li>
          <em>Ad Tech Companies and Other Providers</em> – We may share or make
          available limited Personal Information (such as a mobile device
          identifiers) with ad tech companies and other online service
          providers.
        </li>
        <li>
          <em>Legal Obligation or Safety Reasons</em> – We may disclose
          Personal Information to a third party when we have a good faith
          belief that such disclosure of Personal Information is reasonably
          necessary to (a) satisfy or comply with any requirement of law,
          regulation, legal process, or enforceable governmental request, (b)
          enforce or investigate a potential violation of any agreement you
          have with us, (c) detect, prevent, or otherwise respond to fraud,
          security or technical concerns, (d) support auditing and compliance
          functions, or (e) protect the rights, property, or safety of Subi,
          its employees and clients, or the public against harm.
        </li>
        <li>
          <em>Merger or Change of Control</em> – We may disclose Personal
          Information to third parties as necessary if we are involved in a
          merger, acquisition, or any other transaction involving a change of
          control in our business, including but not limited to, a bankruptcy
          or similar proceeding. Where legally required, we will give you
          notice prior to such disclosure.
        </li>
        <li>
          <em>Other</em> – We may disclose Personal Information to third
          parties when explicitly requested by or consented to by you, or for
          the purposes for which you disclosed the Personal Information to us
          as indicated at the time and point of the disclosure (or as was
          obvious at the time and point of disclosure).
        </li>
      </ul>

      <h2 className={SECTION_HEADING_CLASS}>Sale and Sharing of Personal Information</h2>
      <p className={PARAGRAPH_CLASS}>
        We do not sell Personal Information in exchange for monetary
        compensation. However, we may “share” Personal Information, as defined
        under applicable law, with advertising and analytics providers for
        purposes of cross-context behavioral advertising.
      </p>

      <h2 className={SECTION_HEADING_CLASS}>Cookies and Other Tracking Technologies</h2>
      <p className={PARAGRAPH_CLASS}>
        We and our service providers may use cookies and similar technologies
        to collect usage about how you use the Site. The technologies we use
        for this automatic data collection may include cookies and web beacons
        that permit us to verify system and server integrity and generate
        statistics around the popularity of certain content and Services. We
        process the information collected through such technologies, which may
        include or be combined with Personal Information, to help operate
        certain features of the Site, to enhance your experience through
        personalization, and to help us better understand the features of the
        Site that you and other users are most interested in.
      </p>
      <p className={PARAGRAPH_CLASS}>
        <em>Site Delivery and Appearance</em> – We may use third-party
        providers to enable certain customer interaction opportunities, content
        delivery (like audio or video), or other service capabilities.
        Examples include, but are not limited to, the following functionality:
      </p>
      <ul className={LIST_CLASS}>
        <li>
          <strong>Virtual Assistant Support:</strong> We use an interactive
          chat feature enabled by a large language model that may be provided
          by a third-party (like Google’s Gemini or a similar artificial
          intelligence service provider) to enable a virtual assistant service
          via the Site. When you engage in the chat, you are interacting with
          virtual assistant powered by artificial intelligence, not a human
          representative. Any Personal Information collected via the virtual
          assistant service may be automatically shared with the third-party
          service providers that support this tool and handled according to
          their privacy policy as appropriate. For example, Personal
          Information shared with Google’s Gemini in the course of this
          virtual assistant service will be subject to Google’s Privacy Policy.
        </li>
      </ul>
      <p className={PARAGRAPH_CLASS}>
        <em>Site Analytics and Session Replay</em> – We may use analytics and
        session replay services, that use cookies and other technologies that
        collect your Personal Information, to assist us with analyzing usage
        of the Site to optimize, maintain, and secure the Site and inform
        subsequent business decisions (including, e.g., advertising). Where
        practicable, we configure these tools to avoid capturing sensitive
        information entered into form fields.
      </p>
      <p className={PARAGRAPH_CLASS}>
        <em>Cookie Choices</em> – To manage your preferences with respect to
        these technologies, you can:
      </p>
      <ul className={LIST_CLASS}>
        <li>
          Customize your device settings to refuse all or some cookies, or to
          alert you when apps set or access cookies. If you disable certain
          cookies, please note that some parts of the Site may not function
          properly. These settings may be lost and require reconfiguration if
          you delete your cookies.
        </li>
        <li>
          Block the collection and use of your information by online platforms
          and ad tech companies for the purpose of serving interest-based
          advertising by visiting the opt out pages of the self-regulatory
          programs of which those companies are members: National Advertising
          Initiative and Digital Advertising Alliance. Please note that even
          if you opt out of interest-based advertising, you may still see
          “contextual” ads which are based on the context of what you are
          looking at on the websites and pages you visit.
        </li>
      </ul>
      <p className={PARAGRAPH_CLASS}>
        Review and execute any provider-specific instructions to customize
        your preferences or opt-out of certain processing, including
        interest-based advertising, by third-party service providers.
      </p>

      <h2 className={SECTION_HEADING_CLASS}>How Long We Keep Your Personal Information</h2>
      <p className={PARAGRAPH_CLASS}>
        We retain your information for as long as it is needed: (i) to conduct
        business with you; (ii) fulfill the purposes outlined in this policy;
        and (iii) to comply with our legal obligations, resolve disputes, and
        enforce any agreements.
      </p>
      <p className={PARAGRAPH_CLASS}>
        Criteria we will use to determine how long to retain your Personal
        Information includes the nature and length of our business
        relationship with you; our legal rights, obligations, and retention
        requirements; and if we have an ongoing business purpose for retaining
        your Personal Information, such as communicating with you about
        ongoing or prospective Services you requested.
      </p>

      <h2 className={SECTION_HEADING_CLASS}>Your Privacy Rights</h2>
      <p className={PARAGRAPH_CLASS}>
        Depending on your state of residence, you may have the following
        rights: Right to access Personal Information; Right to delete Personal
        Information; Right to correct inaccuracies; Right to opt out of the
        sale or sharing of Personal Information; Right to opt out of targeted
        advertising and certain profiling; and Right to limit use of Sensitive
        Personal Information.
      </p>
      <p className={PARAGRAPH_CLASS}>
        To exercise your rights, please contact us at{" "}
        <a
          href="mailto:legal@oksubi.com"
          className="text-primary underline"
        >
          legal@oksubi.com
        </a>
        . We will take reasonable steps to verify your identity before
        fulfilling your request, which may include verifying information
        associated with your account or requesting additional information
        where necessary. You may also designate an authorized agent to act on
        your behalf where permitted by law.
      </p>
      <p className={PARAGRAPH_CLASS}>
        We will not discriminate against you for exercising any of your
        privacy rights under applicable law.
      </p>
      <p className={PARAGRAPH_CLASS}>
        Please note that certain features of the Services require the use of
        specific Personal Information. If you choose to exercise certain
        privacy rights (such as deletion or restriction of processing), and
        the requested action limits our ability to process Personal
        Information that is reasonably necessary to provide the Services, some
        or all features of the Services may no longer function properly or may
        become unavailable. In such cases, we will inform you if we are unable
        to fulfill your request without affecting core functionality.
      </p>

      <h2 className={SECTION_HEADING_CLASS}>Links to Third-Party Websites</h2>
      <p className={PARAGRAPH_CLASS}>
        We are not responsible for the practices employed by any websites or
        services linked to or from the Site, including the information or
        content contained within them. We encourage you to investigate and ask
        questions before disclosing Personal Information to third parties,
        since any Personal Information disclosed will be handled in accordance
        with the applicable third party’s privacy policy.
      </p>
      <p className={PARAGRAPH_CLASS}>
        In some cases, we offer links to social media platforms that enable
        you to easily connect with us or share information on social media.
        Any content you post via these social media pages is subject to the
        Terms of Use and Privacy Policies for those platforms.
      </p>
      <p className={PARAGRAPH_CLASS}>
        We may also integrate with other websites to provide enhanced
        services, technological capabilities, or resources for you. These
        plug-in services and capabilities are governed by the terms,
        conditions, and policies of the underlying companies. Some of the
        integrations we currently offer include the ability to view our
        business and/or provider profiles on social media platforms. This
        hyperlinked content (including any embedded customer reviews) is
        governed according to the privacy policies for each platform. We may
        also give you the option to login to the Site’s platforms via
        third-party services. If you choose to leverage this option to link
        your accounts, we will receive information associated with your
        account (such as your name and profile information) from that
        third-party service. This information varies and is controlled by
        that service or as authorized by you via your privacy settings at
        that service. We recommend reviewing the service’s privacy policy
        beforehand and managing your privacy settings on an ongoing basis.
      </p>

      <h2 className={SECTION_HEADING_CLASS}>International Use and Cross-Border Data Transfers</h2>
      <p className={PARAGRAPH_CLASS}>
        If you are using the Site from outside of the United States, please
        note that our Site is hosted in the United States. Where permitted by
        applicable law, we may transfer the personal data we collect about
        you to the United States and other jurisdictions that may not be
        deemed to provide the same level of data protection as your home
        country, as necessary for the purposes set out in this Notice.
      </p>

      <h2 className={SECTION_HEADING_CLASS}>How We Protect Personal Information</h2>
      <p className={PARAGRAPH_CLASS}>
        We have implemented commercially reasonable measures designed to
        secure your Personal Information from accidental loss and from
        unauthorized access, use, alteration, and disclosure. Unfortunately,
        the transmission of information via the internet is not completely
        secure. Despite these efforts to store Personal Information in a
        secure environment, we cannot guarantee the security of Personal
        Information during its transmission or its storage on our systems.
      </p>

      <h2 className={SECTION_HEADING_CLASS}>Children’s Privacy</h2>
      <p className={PARAGRAPH_CLASS}>
        We do not knowingly collect or solicit any Personal Information from
        children, as defined under applicable law, without verified written
        parental consent, and we have no actual knowledge of selling such
        Personal Information of minors under 16 years of age. If we learn
        that we have collected Personal Information from a child, we will
        promptly take steps to delete that information. If you believe we
        might have any information from or about a child, please contact us
        at{" "}
        <a
          href="mailto:legal@oksubi.com"
          className="text-primary underline"
        >
          legal@oksubi.com
        </a>
        .
      </p>

      <h2 className={SECTION_HEADING_CLASS}>Changes to this Notice</h2>
      <p className={PARAGRAPH_CLASS}>
        Please note that we may modify or update this Notice from time to
        time, so please review it periodically. If we make material changes
        to how we treat Personal Information, we will notify you according to
        applicable law. Unless otherwise indicated, any changes to this
        Notice will apply immediately upon notification to the Site. You are
        responsible for periodically visiting the Site and this Notice to
        check for any changes.
      </p>

      <h2 className={SECTION_HEADING_CLASS}>Contact Us</h2>
      <p className={PARAGRAPH_CLASS}>
        If you have any questions about our practices handling your Personal
        Information, or this Notice, please contact us at{" "}
        <a
          href="mailto:legal@oksubi.com"
          className="text-primary underline"
        >
          legal@oksubi.com
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
